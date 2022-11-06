import { expect } from "chai"
import { IBlock } from "../src/block"
import { chainIsValid, IBlockchain, IBlockchainComparison, InvalidBlockError, makeShouldAccept } from "../src/blockchain";
import { InMemoryBlockchain as Blockchain } from "../src/blockchain";


const makeBlock = (hash: string, prevHash: string | null): IBlock => {
    return {
        hash,
        prevHash,
        contents: {
            toHash: () => "contents"
        },
        nonce: "nonce"
    }
}

describe("in-memory blockchain", () => {
    describe("comparison", () => {

        let shouldAccept: IBlockchainComparison;

        beforeEach(() => {
            shouldAccept = makeShouldAccept([
                (_current, candidate) => chainIsValid(candidate),
                (_current, candidate) => candidate.size > 0,
                (current, candidate) => current.size < candidate.size || !chainIsValid(current),
            ])
        })

        it("longer valid beats shorter valid", () => {
            let b1 = new Blockchain([
                makeBlock("foo", null),
                makeBlock("bar", "foo"),
                makeBlock("baz", "bar")
            ]);
            let b2 = new Blockchain([
                makeBlock("foo", null),
                makeBlock("bar", "foo")
            ]);

            let result = shouldAccept(b1, b2)
            expect(result).to.equal(false)
        })
        
        it("same length valid beats not valid", () => {
            let b1 = new Blockchain([
                makeBlock("foo", null),
                makeBlock("bar", "foo")
            ]);
            let b2 = new Blockchain([
                makeBlock("foo", null),
                makeBlock("bar", "baz")
            ]);
            let result = shouldAccept(b1, b2)
            expect(result).to.equal(false)
        })

        it("current valid loses to longer valid candidate", () => {
            let b1 = new Blockchain([makeBlock("foo", null)]);
            let b2 = new Blockchain([makeBlock("foo", null), makeBlock("bar", "foo")]);
            let result = shouldAccept(b1, b2)
            expect(result).to.equal(true)
        })

        it("valid non-empty candidate beats invalid current", () => {
            let b1 = new Blockchain([makeBlock("foo", "doesn't exist"), makeBlock("bar", "foo")]);
            let b2 = new Blockchain([makeBlock("foo", null)]);
            let result = shouldAccept(b1, b2)
            expect(result).to.equal(true)
        })
    })

    describe("adding new blocks", () => {
        let bc: IBlockchain;

        beforeEach(() => {
            bc = new Blockchain([makeBlock("foo", null)])
        })

        it("new block with incorrect prevHash is rejected", () => {
            let block = makeBlock("bar", "baz")
            expect(() => bc.addBlock(block)).to.throw(InvalidBlockError)
        })

        it("new block with correct prevHash becomes latest bock", () => {
            let block = makeBlock("bar", "foo")
            bc.addBlock(block)
            expect(bc.getLastBlock().hash).to.equal(block.hash)
        })
    })
})