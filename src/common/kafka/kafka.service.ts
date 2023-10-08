import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachMessagePayload, Kafka, LogEntry, Partitioners, Producer, logLevel } from 'kafkajs';
import { SUBSCRIBER_FIXED_FN_REF_MAP, SUBSCRIBER_FN_REF_MAP, SUBSCRIBER_OBJ_REF_MAP } from './kafka.decorator';
import { KafkaConfig, KafkaPayload } from './kafka.message';

const CONSUMER_FROM_BEGINNING = true;

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  private fixedConsumer: Consumer;
  private readonly consumerSuffix = '-' + Math.floor(Math.random() * 100000);

  constructor(private kafkaConfig: KafkaConfig) {
    console.log('kafkaConfig', this.kafkaConfig.brokers);
    this.kafka = new Kafka({
      clientId: this.kafkaConfig.clientId,
      brokers: this.kafkaConfig.brokers,
      logCreator: this.kafkaLogger.bind(this),
    });
    this.producer = this.kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
    this.consumer = this.kafka.consumer({
      groupId: this.kafkaConfig.groupId + this.consumerSuffix,
    });
    this.fixedConsumer = this.kafka.consumer({
      groupId: this.kafkaConfig.groupId,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();

      await this.subscribeToTopics(SUBSCRIBER_FN_REF_MAP, this.consumer, this.bindAllTopicToConsumer);
      await this.subscribeToTopics(SUBSCRIBER_FIXED_FN_REF_MAP, this.fixedConsumer, this.bindAllTopicToFixedConsumer);

      await this.runConsumer(this.fixedConsumer, SUBSCRIBER_FIXED_FN_REF_MAP);
      await this.runConsumer(this.consumer, SUBSCRIBER_FN_REF_MAP);
    } catch (error) {
      this.logger.error('Failed to initialize Kafka', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.disconnect();
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.fixedConsumer.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.fixedConsumer.disconnect();
  }

  private async subscribeToTopics(
    map: Map<string, (...args: any[]) => any>,
    consumer: Consumer,
    bindFunction: (...args: any[]) => any,
  ): Promise<void> {
    for (const [topic, functionRef] of map.entries()) {
      if (!!functionRef) {
        await bindFunction.call(this, consumer, topic);
      }
    }
  }

  private async bindAllTopicToConsumer(consumer: Consumer, topic: string): Promise<void> {
    await consumer.subscribe({ topic, fromBeginning: CONSUMER_FROM_BEGINNING });
  }

  private async bindAllTopicToFixedConsumer(consumer: Consumer, topic: string): Promise<void> {
    await consumer.subscribe({ topic, fromBeginning: CONSUMER_FROM_BEGINNING });
  }

  private async runConsumer(consumer: Consumer, map: Map<string, (...args: any[]) => any>): Promise<void> {
    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const functionRef = map.get(topic);
        if (functionRef) {
          const object = SUBSCRIBER_OBJ_REF_MAP.get(topic);
          try {
            if (message.value !== null) {
              await functionRef.apply(object, [
                { key: message.key ? message.key.toString() : null, value: JSON.parse(message.value.toString()) },
              ]);
            }
          } catch (error) {
            // 예외 처리: 메시지 처리 중 오류 발생 시 로그 남기고 다음 메시지로 진행
            this.logger.error(`Error processing message from topic ${topic}: ${error}`);
          }
        }
      },
    });
  }

  async sendMessage<T>(
    kafkaTopic: string,
    kafkaMessage: {
      message: KafkaPayload<T>;
      key?: string;
    },
  ): Promise<any> {
    try {
      const { message, key } = kafkaMessage;

      const metadata = await this.producer.send({
        topic: kafkaTopic,
        messages: [
          {
            key: key ? key : null,
            value: JSON.stringify({
              ...message,
              createdTime: new Date().toISOString(),
            }),
          },
        ],
      });
      return metadata;
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw error;
    }
  }

  private kafkaLogger(inputLevel: logLevel): any {
    return ({ namespace, level, label, log }: LogEntry) => {
      const { message, ...extra } = log;
      const logMessage = `${inputLevel} ${label} ${message}`;
      const context = `Kafka ${namespace} ${label}`;
      switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
          this.logger.error(logMessage, extra ? JSON.stringify(extra) : '', context);
          break;
        case logLevel.WARN:
          this.logger.warn(logMessage, extra ? JSON.stringify(extra) : '', context);
          break;
        case logLevel.INFO:
          this.logger.log(logMessage, context);
          break;
        case logLevel.DEBUG:
          this.logger.debug(logMessage, context);
          break;
      }
    };
  }
}
