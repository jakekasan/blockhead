import { expect } from "chai"
import { IBlock } from "../src/block"
import { chainIsValid, IBlockchainComparison, makeShouldAccept } from "../src/blockchain";
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
})