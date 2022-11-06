import { IHashFunction } from "./hash"

export interface IResultCheck {
    (result: String): boolean
}

export interface IMineFunction {
    (contents: string): IMineResult
}

export interface IMineFunctionFactory {
    (nonceFactory: INonceFactory, validityCheck: IResultCheck): IMineFunction
}

export interface INonceFactory {
    (): string
}

export interface IPayloadFormatter {
    (payload: string, nonce: string): string
}

export interface IMineResult {
    content: string,
    nonce: string,
    hash: string
}

export const makeMineFunction = (
    getNextNonce: INonceFactory,
    isResultValid: IResultCheck,
    hashFunction: IHashFunction,
    formatPayload: IPayloadFormatter,
    ) => {

    return (content: string): IMineResult => {
        let result: string;
        let nonce: string;

        do {
            nonce = getNextNonce()
            let formattedPayload = formatPayload(content, nonce) 
            result = hashFunction(formattedPayload)
        } while (!isResultValid(result))
    
        return {
            hash: result,
            content: content,
            nonce: nonce
        }
    }
}
