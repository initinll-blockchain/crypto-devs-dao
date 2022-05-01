export type Proposal = {
    proposalId: string,
    nftTokenId:string,
    deadline: Date,
    yayVotes: string,
    nayVotes: string,
    executed: boolean,
}