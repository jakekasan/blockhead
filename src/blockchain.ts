import { IBlock, IBlockContents } from "../src/block"

export interface IBlockchain {
    size: number,
    getBlockByHash: (hash: string) => IBlock,
    getLastBlock: () => IBlock
}

export class InMemoryBlockchain implements IBlockchain {

    constructor (readonly blocks: IBlock[]) {}

    get size() {
        return this.blocks.length
    }

    getBlockByHash = (hash: string) => {
        for (const block of this.blocks) {
            if (block.hash === hash) {
                return block
            }
        }
        throw new Error(`Block with hash'${hash}' not found`);
    };

    getLastBlock = () => {
        const result = this.blocks.at(-1)

        if (result === undefined) {
            throw new Error("Blockchain is empty");
        }

        return result
    }
}


export interface IBlockchainComparison {
    (left: IBlockchain, right: IBlockchain): boolean
}

export interface IVerifyBlockchainFactory {
    (requirements: [IBlockchainComparison, ...IBlockchainComparison[]]): IBlockchainComparison
}

export const makeShouldAccept: IVerifyBlockchainFactory = reqs => {
    return (left, right) => {
        for (const req of reqs) {
            if (!req(left, right)) return false
        }
        return true
    }
}

export const chainIsValid = (bc: IBlockchain): boolean => {
    let block = bc.getLastBlock()
    while (block.prevHash !== null) {
        try {
            block = bc.getBlockByHash(block.prevHash)
        } catch (e) {
            return false
        }
    }
    return true
}
