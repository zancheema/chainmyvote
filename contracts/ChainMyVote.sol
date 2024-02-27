pragma solidity 0.8.19;

contract ChainMyVote {
    address private owner;
    uint private CANDIDATE_ID;
    uint private VOTER_ID;

    struct Candidate {
        uint id;
        string title;
        string _address;
        string party;
        string logo;
    }
    
    struct Voter {
        uint id;
        string brpNumber;
        string email;
        string firstName;
        string lastName;
        string brpPicture;
        bool verified;
    }
    
    // Candidate
    Candidate[] private candidates;
    mapping(uint => uint) private candidateVotes;

    // Voter
    address[] private voters;
    mapping(string => bool) private brpExists;
    mapping(address => bool) private voterExists;
    mapping(address => Voter) private voterByAddress;
    mapping(uint => Voter) private voterById;
    mapping(uint => bool) private voterIdExists;
    mapping(uint => address) voterAddressById;
    mapping(address => bool) private voteCast;

    // Elections finished
    bool private electionsFinished;
    Candidate[] private winners;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Sender is not owner.");
        _;
    }

    modifier isNotOwner() {
        require(msg.sender != owner, "Sender is the owner.");
        _;
    }

    modifier voterIdDoesExist(uint id) {
        require(voterIdExists[id], "Voter id does not exist.");
        _;
    }

    modifier voterBrpDoesNotExist(string memory brpNumber) {
        require(!brpExists[brpNumber], "Voter BRP already exists.");
        _;
    }

    modifier isVerifiedVoter() {
        require(
            voterExists[msg.sender] && voterByAddress[msg.sender].verified, 
            "Sender is not a verified voter."
        );
        _;
    }

    modifier voteIsNotCast() {
        require(!voteCast[msg.sender], "Vote is already cast.");
        _;
    }

    modifier electionsAreFinished() {
        require(electionsFinished, "Elections are not finished yet.");
        _;
    }

    modifier electionsAreNotFinished() {
        require(!electionsFinished, "Elections are finished.");
        _;
    }

    event CandidateAdded(Candidate candidate);

    function addCandidate(
        string memory title,
        string memory _address,
        string memory party,
        string memory logo
    ) electionsAreNotFinished isOwner public {
        uint candidateId = ++CANDIDATE_ID;
        Candidate memory candidate = Candidate(candidateId, title, _address, party, logo);
        candidates.push(candidate);
        candidateVotes[candidateId] = 0;
        emit CandidateAdded(candidate);
    }

    function getCandidates() electionsAreNotFinished public view returns (Candidate[] memory) {
        return candidates;
    }

    event VoterAdded(Voter);

    function addVoter(
        string memory brpNumber,
        string memory email,
        string memory firstName,
        string memory lastName,
        string memory brpPicture
    ) electionsAreNotFinished isNotOwner voterBrpDoesNotExist(brpNumber) public {
        uint voterId = ++VOTER_ID;
        Voter memory voter = Voter(
            voterId, brpNumber, email, firstName, lastName, brpPicture, false);
        voters.push(msg.sender);
        voterExists[msg.sender] = true;
        voterByAddress[msg.sender] = voter;
        voterById[voterId] = voter;
        voterIdExists[voterId] = true;
        voterAddressById[voterId] = msg.sender;
        emit VoterAdded(voter);
    }

    event VoterVerified(Voter);

    function verifyVoter(Voter memory voter) 
    electionsAreNotFinished isOwner voterIdDoesExist(voter.id) voterBrpDoesNotExist(voter.brpNumber) public {
        Voter memory savedVoter = voterById[voter.id];
        savedVoter.verified = true;
        brpExists[savedVoter.brpNumber] = true;
        address voterAddress = voterAddressById[savedVoter.id];
        voterById[savedVoter.id] = savedVoter;
        voterByAddress[voterAddress] = savedVoter;
        emit VoterVerified(savedVoter);
    }

    function getVoters() electionsAreNotFinished isOwner public view returns (Voter[] memory) {
        Voter[] memory result = new Voter[](voters.length);
        for (uint i = 0; i < voters.length; i++) {
            result[i] = voterByAddress[voters[i]];
        }
        return result;
    }

    function getVoterStatus() electionsAreNotFinished isNotOwner public view returns (string memory) {
        if (voteCast[msg.sender]) return "vote-cast";
        if (voterExists[msg.sender]) {
            Voter memory voter = voterByAddress[msg.sender];
            if (voter.verified) return "verified";
            return "unverified";
        }
        return "unregistered";
    }

    event VoteCast(bool success);

    function castVote(uint candidateId) electionsAreNotFinished public {
        candidateVotes[candidateId]++;
        voteCast[msg.sender] = true;
        emit VoteCast(true);
    }

    function getVotes(uint candidateId) isOwner public view returns (uint) {
        return candidateVotes[candidateId];
    }

    event ElectionsFinished(Candidate[] winners);

    function finishElections() electionsAreNotFinished isOwner() public {
        uint maxVotes = 0;
        // get max votes
        for (uint i = 0; i < candidates.length; i++) {
            uint votes = candidateVotes[candidates[i].id];
            if (votes > maxVotes) {
                maxVotes = votes;
            }
        }

        // get winner ids
        for (uint i = 0; i < candidates.length; i++) {
            Candidate memory candidate = candidates[i];
            if (candidateVotes[candidate.id] == maxVotes) {
                winners.push(candidate);
            }
        }

        electionsFinished = true;
        emit ElectionsFinished(winners);

        // Candidate memory _winner;
        // uint maxVotes = 0;
        // for (uint i = 0; i < candidates.length; i++) {
        //     Candidate memory candidate = candidates[i];
        //     uint votes = candidateVotes[candidate.id];
        //     if (votes > maxVotes) {
        //         maxVotes = votes;
        //         _winner = candidate;
        //     }
        // }
        // winner = _winner;
        // electionsFinished = true;
        // emit ElectionsFinished(winner);
    }

    function areElectionsFinished() public view returns (bool) {
        return electionsFinished;
    }

    function getWinners() electionsAreFinished public view returns (Candidate[] memory) {
        return winners;
    }

    struct AccountStatus {
        string accountType;
        bool electionsFinished;
        string voteStatus;
    }

    function getAccountStatus() public view returns (AccountStatus memory) {
        string memory accountType;
        string memory voteStatus = "NILL";

        if (msg.sender == owner) {
            accountType = "owner";
        } else if (voterExists[msg.sender]) {
            accountType = "voter";
            if (voteCast[msg.sender]) {
                voteStatus = "vote-cast";
            } else if (voterExists[msg.sender]) {
                Voter memory voter = voterByAddress[msg.sender];
                if (voter.verified) voteStatus = "verified";
                else voteStatus = "unverified";
            }
        } else {
            accountType = "unregistered";
        }

        return AccountStatus(accountType, electionsFinished, voteStatus);
    }
}