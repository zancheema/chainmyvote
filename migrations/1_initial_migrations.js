const ChainMyVote = artifacts.require('ChainMyVote');

module.exports = function (deployer) {
    deployer.deploy(ChainMyVote);
}
