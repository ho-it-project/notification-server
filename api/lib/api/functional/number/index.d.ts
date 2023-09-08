/**
 * @packageDocumentation
 * @module api.functional.number
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
import { Fetcher } from "@nestia/fetcher";
import type { IConnection, Primitive } from "@nestia/fetcher";
import typia from "typia";
/**
 * @controller AppController.getNumberTest()
 * @path GET /number/:name
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export declare function getNumberTest(connection: IConnection, name: number): Promise<getNumberTest.Output>;
export declare namespace getNumberTest {
    type Output = Primitive<number>;
    const METHOD: "GET";
    const PATH: string;
    const ENCRYPTED: Fetcher.IEncrypted;
    const path: (name: number) => string;
    const random: (g?: Partial<typia.IRandomGenerator>) => Output;
    const simulate: (connection: IConnection, name: number) => Promise<Output>;
}
