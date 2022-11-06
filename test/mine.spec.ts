import { expect } from "chai";
import {INonceFactory, IResultCheck, makeMineFunction} from "./../src/mine"

describe("mining", () => {

    let isValid: IResultCheck;
    let getNextNonce: INonceFactory;

    beforeEach(() => {
        function* nonceFactory() {
            for (const nonce of [1, 2, 3]) yield nonce.toString()
        }

        let nf = nonceFactory();

        getNextNonce = () => {
            let nextValue = nf.next();
            if (nextValue.done) throw Error
            return nextValue.value
        }

        function* isValidFactory() {
            for (const valid of [false, false, true]) yield valid
        }
        let vf = isValidFactory()
    
        isValid = () => {
            let nextValue = vf.next();
            if (nextValue.done) throw Error
            return nextValue.value
        }
    })

    it("continues until condition is met", () => {

        let mineFunction = makeMineFunction(getNextNonce, isValid, contents => contents, (payload, nonce) => `${payload}${nonce}`)

        let result = mineFunction(`my content`)

        expect(result).property("nonce").to.equal("3")
    })
})