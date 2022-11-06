
export interface IBlockContents {
    toHash: () => string
}

export interface IBlock {
    hash: string,
    nonce: string,
    contents: IBlockContents,
    prevHash: string | null
}
