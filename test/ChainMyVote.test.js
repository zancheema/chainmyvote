const ChainMyVote = artifacts.require('ChainMyVote');

contract('ChainMyVote', async (accounts) => {
    let voteContract;
    const ownerAccount = accounts[0];
    const userAccount1 = accounts[1];
    const userAccount2 = accounts[2];

    const ownerUser = {
        firstName: 'first_owner',
        lastName: 'last_owner',
        email: 'owner@example.com',
    };
    const account1User = {
        firstName: 'first_1',
        lastName: 'last_1',
        email: 'user_1@example.com',
    };
    const account2User = {
        firstName: 'first_2',
        lastName: 'last_2',
        email: 'user_2@example.com',
    };

    beforeEach(async () => {
        voteContract = await ChainMyVote.new({ from: ownerAccount });
    });

    it('should not add candidate if account is not owner', async () => {
        try {
            await voteContract.addCandidate('title', 'address', 'party', 'logo', { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Sender is not owner.');
        }
    });

    it('should not candidate if elections are finished', async () => {
        try {
            await voteContract.finishElections({ from: ownerAccount });
            await voteContract.addCandidate('title', 'address', 'party', 'logo', { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    it('should add candidate to candidates', async () => {
        const title = 'title';
        const address = 'address';
        const party = 'some party';
        const logo = 'LOGO';
        await voteContract.addCandidate(title, address, party, logo);
        const candidates = await voteContract.getCandidates({ from: ownerAccount });

        assert.equal(candidates.length, 1);
        const candidate = candidates[0];
        assert.equal(candidate.title, title);
        assert.equal(candidate._address, address);
        assert.equal(candidate.party, party);
        assert.equal(candidate.logo, logo);
    });
    
    it('should not add voter if elections are finished', async () => {
        await voteContract.finishElections({ from: ownerAccount });
        try {
            await voteContract.addVoter(
                'brp3343', 'user@example.com', 'first', 'last', 'http://dummy.jpg',
                { from: userAccount1 }
            );
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    it('should not add owner as voter', async () => {
        try {
            await voteContract.addVoter(
                'brp3343', 'user@example.com', 'first', 'last', 'http://dummy.jpg',
                { from: ownerAccount }
            );
        } catch (e) {
            assert.include(e.message, 'Sender is the owner.');
        }
    });

    it('should not add duplicate voter brp numbers', async () => {
        const brpNumber = 'brp3343'
        await voteContract.addVoter(
            brpNumber, 'user@example.com', 'first', 'last', 'http://dummy.jpg',
            { from: userAccount1 }
        );
        try {
            await voteContract.addVoter(
                brpNumber, 'user@example.com', 'first', 'last', 'http://dummy.jpg',
                { from: userAccount2 }
            );
        } catch (e) {
            assert.include(e.message, 'Voter BRP already exists.');
        }
    });

    it('should add voter to voters', async () => {
        const brpNumber = 'brp-123';
        const email = 'user@example.com';
        const firstname = 'first';
        const lastname = 'last';
        const brpPicture = 'https://dummy.jpeg';
        await voteContract.addVoter(
            brpNumber, email, firstname, lastname, brpPicture,
            { from: userAccount1 }
        );

        const voters = await voteContract.getVoters({ from: ownerAccount });
        assert.equal(voters.length, 1);
        assert.equal(voters[0].brpNumber, brpNumber);
        assert.equal(voters[0].email, email);
        assert.equal(voters[0].firstName, firstname);
        assert.equal(voters[0].lastName, lastname);
        assert.equal(voters[0].brpPicture, brpPicture);
    });

    it('should not get voters if elections are finished', async () => {
        await voteContract.finishElections({ from: ownerAccount });
        try {
            await voteContract.getVoters({ from: ownerAccount });
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    if('should not get voters if account is not owner', async () => {
        try {
            await voteContract.getVoters({ from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Sender is not owner.');
        }
    });

    it('should not verify voter if elections are finished', async () => {
        await voteContract.finishElections({ from: ownerAccount });
        try {
            await voteContract.verifyVoter(
                [1, 'brp', 'user@email.com', 'first', 'last', 'https://pic', false],
                { from: ownerAccount }
            );
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    it('should not verify voter if account is not owner', async () => {
        try {
            await voteContract.verifyVoter(
                [1, 'brp', 'user@email.com', 'first', 'last', 'https://pic', false],
                { from: userAccount1 }
            );
        } catch (e) {
            assert.include(e.message, 'Sender is not owner.');
        }
    });

    it('should not verify voter if voter id does not exist', async () => {
        try {
            await voteContract.verifyVoter(
                [1, 'brp', 'user@email.com', 'first', 'last', 'https://pic', false],
                { from: ownerAccount }
            );
        } catch (e) {
            assert.include(e.message, 'Voter id does not exist.');
        }
    });

    it('should not verify voter if voter BRP already exists', async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [1, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        try {
            await voteContract.verifyVoter(
                [1, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified], 
                { from: ownerAccount }
            );
        } catch (e) {
            assert.include(e.message, 'Voter BRP already exists.');
        }
    });

    it('should not let vote to be cast if elections have finished', async () => {
        await voteContract.finishElections({ from: ownerAccount });
        try {
            await voteContract.castVote(1, { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    it('should should let vote to be cast if account is not verified voter', async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        try {
            await voteContract.castVote(1, { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Sender is not a verified voter.');
        }
    });

    it('should not let voter to cast duplicate votes', async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [1, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        await voteContract.castVote(1, { from: userAccount1 });

        try {
            await voteContract.castVote(1, { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Vote is already cast.');
        }
    });

    it('should increment votes for the candidate being cast vote to', async () => {
        const candidateId = 1;
        let votes = await voteContract.getVotes(candidateId, { from: ownerAccount });
        assert.equal(votes, 0);

        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [candidateId, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        await voteContract.castVote(1, { from: userAccount1 });

        votes = await voteContract.getVotes(candidateId, { from: ownerAccount });
        assert.equal(votes, 1);
    });

    it('should not allow to get votes if account is not owner', async () => {
        try {
            await voteContract.getVotes(1, { from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Sender is not owner.');
        }
    });

    it('should get the votes cast to candidate', async () => {
        const candidateId = 1;

        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [candidateId, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        await voteContract.castVote(1, { from: userAccount1 });

        const votes = await voteContract.getVotes(candidateId, { from: ownerAccount });
        assert.equal(votes, 1);
    });

    it('should not allow to finish elections if account is not owner', async () => {
        try {
            await voteContract.finishElections({ from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Sender is not owner.');
        }
    });

    it('should finish elections if finishElections is called by owner', async () => {
        let finished = await voteContract.areElectionsFinished();
        assert.equal(finished, false);

        await voteContract.finishElections({ from: ownerAccount });
        finished = await voteContract.areElectionsFinished();
        assert.equal(finished, true);
    });

    it('should not get winner if elections are not finished', async () => {
        try {
            const winner = await voteContract.getWinner();
        } catch (e) {
            assert.include(e.message, '');
        }
    });

    it('should return winner as the candidate with most votes', async () => {
        await voteContract.addCandidate('title', 'address', 'party', 'logo', { from: ownerAccount });
        const candidates = await voteContract.getCandidates({ from: ownerAccount });
        const candidateId = candidates[0].id;

        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [voter.id, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        await voteContract.castVote(candidateId, { from: userAccount1 });

        await voteContract.finishElections({ from: ownerAccount });

        const winner = await voteContract.getWinner();
        assert.equal(winner.id, candidateId);
    });

    it("should return accountType as 'owner' account status for contract owner", async () => {
        const status = await voteContract.getAccountStatus({ from: ownerAccount });
        assert.equal(status.accountType, 'owner');
    });

    it("should return accountType as 'voter' for voter", async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );
        const status = await voteContract.getAccountStatus({ from: userAccount1 });
        assert.equal(status.accountType, 'voter');
    });

    it("should return accountType as 'unregistered' if account is neither voter nor owner", async () => {
        const status = await voteContract.getAccountStatus({ from: userAccount1 });
        assert.equal(status.accountType, 'unregistered');
    });

    it('should not get voter status if elections are finished', async () => {
        await voteContract.finishElections({ from: ownerAccount });
        try {
            await voteContract.getVoterStatus({ from: userAccount1 });
        } catch (e) {
            assert.include(e.message, 'Elections are finished.');
        }
    });

    it('should not return voter status for contract owner', async () => {
        try {
            await voteContract.getVoterStatus({ from: ownerAccount });
        } catch (e) {
            assert.include(e.message, 'Sender is the owner.');
        }
    });

    it("should return voter status as 'unregistered' for account not registered as voter yet", async () => {
        const status = await voteContract.getVoterStatus({ from: userAccount1 });
        assert.equal(status, 'unregistered');
    });

    it("should return voter status as 'unverified' for voter who is not verified yet", async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );

        const status = await voteContract.getVoterStatus({ from: userAccount1 });
        assert.equal(status, 'unverified');
    });

    it("should return voter status as 'verified' for verified voter", async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );
        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [voter.id, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );

        const status = await voteContract.getVoterStatus({ from: userAccount1 });
        assert.equal(status, 'verified');
    });

    it("should return voter status as 'vote-cast' for voter who has cast vote", async () => {
        await voteContract.addVoter(
            'brp', 'user@email.com', 'first', 'last', 'https://pic',
            { from: userAccount1 }
        );
        const voter = (await voteContract.getVoters({ from: ownerAccount }))[0];
        await voteContract.verifyVoter(
            [voter.id, voter.brpNumber, voter.email, voter.firstName, voter.lastName, voter.brpPicture, voter.verified],
            { from: ownerAccount }
        );
        await voteContract.castVote(1, { from: userAccount1 });

        const status = await voteContract.getVoterStatus({ from: userAccount1 });
        assert.equal(status, 'vote-cast');
    });
});
