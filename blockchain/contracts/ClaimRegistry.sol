// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ClaimRegistry {
    struct Claim {
        string claimId;
        string ipfsCid;
        bool isFraud;
        string riskLevel;
        uint256 estimatedCost;
        string status; // "Submitted", "Approved", "Rejected"
        uint256 timestamp;
    }

    mapping(string => Claim) public claims;
    string[] public claimIds;

    event ClaimCreated(string indexed claimId, string ipfsCid, uint256 timestamp);
    event ClaimStatusUpdated(string indexed claimId, string newStatus, uint256 timestamp);

    function createClaim(
        string memory _claimId,
        string memory _ipfsCid,
        bool _isFraud,
        string memory _riskLevel,
        uint256 _estimatedCost,
        string memory _status
    ) public {
        require(bytes(claims[_claimId].claimId).length == 0, "Claim ID already exists");

        claims[_claimId] = Claim({
            claimId: _claimId,
            ipfsCid: _ipfsCid,
            isFraud: _isFraud,
            riskLevel: _riskLevel,
            estimatedCost: _estimatedCost,
            status: _status,
            timestamp: block.timestamp
        });

        claimIds.push(_claimId);
        emit ClaimCreated(_claimId, _ipfsCid, block.timestamp);
    }

    function updateClaimAnalysis(
        string memory _claimId,
        bool _isFraud,
        string memory _riskLevel,
        uint256 _estimatedCost
    ) public {
        require(bytes(claims[_claimId].claimId).length > 0, "Claim does not exist");
        Claim storage c = claims[_claimId];
        c.isFraud = _isFraud;
        c.riskLevel = _riskLevel;
        c.estimatedCost = _estimatedCost;
        // Optionally update status to "Analyzed"? No, keep status separate.
    }

    function updateClaimStatus(string memory _claimId, string memory _newStatus) public {
        require(bytes(claims[_claimId].claimId).length > 0, "Claim does not exist");
        claims[_claimId].status = _newStatus;
        emit ClaimStatusUpdated(_claimId, _newStatus, block.timestamp);
    }

    function getClaim(string memory _claimId) public view returns (Claim memory) {
        require(bytes(claims[_claimId].claimId).length > 0, "Claim does not exist");
        return claims[_claimId];
    }

    function getAllClaimIds() public view returns (string[] memory) {
        return claimIds;
    }
}
