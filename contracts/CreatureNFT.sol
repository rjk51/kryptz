// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CreatureNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    uint256 private _tokenIdCounter;

    mapping(uint256 => uint256) private _xp;
    mapping(uint256 => uint256) private _level;
    mapping(uint256 => uint256) private _power;
    mapping(uint256 => uint256) private _speed;
    mapping(uint256 => uint256) private _defense;
    mapping(uint256 => uint256) private _intelligence;
    mapping(uint256 => string) public rarity;
    mapping(uint256 => uint256) public lastBredAt;

    uint256 public breedingCooldown = 1 minutes; 

    event XPAdded(uint256 indexed tokenId, uint256 amount, uint256 newXP);
    event LevelUp(uint256 indexed tokenId, uint256 newLevel);
    event CreatureBred(uint256 indexed parent1, uint256 indexed parent2, uint256 newTokenId);

    constructor(address initialOwner) ERC721("CreatureNFT", "CRTR") Ownable(initialOwner) {}

    function mintCreature(
        address to,
        string memory uri,
        uint256 powerInit,
        uint256 speedInit,
        uint256 defenseInit,
        uint256 intelligenceInit,
        string memory rarityLevel
    ) public {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _level[tokenId] = 1;
        _xp[tokenId] = 0;
        _power[tokenId] = powerInit;
        _speed[tokenId] = speedInit;
        _defense[tokenId] = defenseInit;
        _intelligence[tokenId] = intelligenceInit;
        rarity[tokenId] = rarityLevel;
    }

    function trainTrait(uint256 tokenId, string memory trait, uint256 amount) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(amount > 0, "Amount must be > 0");
        bytes32 traitHash = keccak256(bytes(trait));
        if (traitHash == keccak256("Power")) {
            _power[tokenId] += amount;
        } else if (traitHash == keccak256("Speed")) {
            _speed[tokenId] += amount;
        } else if (traitHash == keccak256("Defense")) {
            _defense[tokenId] += amount;
        } else if (traitHash == keccak256("Intelligence")) {
            _intelligence[tokenId] += amount;
        } else {
            revert("Invalid trait");
        }
    }

    function getTraits(uint256 tokenId) public view returns (uint256 power, uint256 speed, uint256 defense, uint256 intelligence) {
        power = _power[tokenId];
        speed = _speed[tokenId];
        defense = _defense[tokenId];
        intelligence = _intelligence[tokenId];
    }

    function mintFirstCreature() public {
        require(balanceOf(msg.sender) == 0, "You already own a creature");

        string memory uri = "https://example.com/default-creature.json";
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        _level[tokenId] = 1;
        _xp[tokenId] = 0;
        _power[tokenId] = 50;
        _speed[tokenId] = 50;
        _defense[tokenId] = 50;
        _intelligence[tokenId] = 50;
        rarity[tokenId] = "Common";
    }

    function addXP(uint256 tokenId, uint256 amount) public {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _xp[tokenId] += amount;

        while (_xp[tokenId] >= xpToNextLevel(_level[tokenId])) {
            _xp[tokenId] -= xpToNextLevel(_level[tokenId]);
            _level[tokenId] += 1;
            emit LevelUp(tokenId, _level[tokenId]);
        }

        emit XPAdded(tokenId, amount, _xp[tokenId]);
    }

    function xpToNextLevel(uint256 currentLevel) public pure returns (uint256) {
        return 100 * currentLevel;
    }

    function getXP(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _xp[tokenId];
    }

    function getLevel(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _level[tokenId];
    }

    function breedCreatures(
        uint256 parent1,
        uint256 parent2,
        string memory newURI,
        string memory rarityLevel
    ) public {
        require(ownerOf(parent1) == msg.sender && ownerOf(parent2) == msg.sender, "You must own both parents");
        require(parent1 != parent2, "Cannot breed a creature with itself");
        require(block.timestamp >= lastBredAt[parent1] + breedingCooldown, "Parent 1 still on cooldown");
        require(block.timestamp >= lastBredAt[parent2] + breedingCooldown, "Parent 2 still on cooldown");

        uint256 newPower = (_power[parent1] + _power[parent2]) / 2;
        uint256 newSpeed = (_speed[parent1] + _speed[parent2]) / 2;
        uint256 newDefense = (_defense[parent1] + _defense[parent2]) / 2;
        uint256 newIntelligence = (_intelligence[parent1] + _intelligence[parent2]) / 2;

        mintCreature(msg.sender, newURI, newPower, newSpeed, newDefense, newIntelligence, rarityLevel);

        uint256 newId = _tokenIdCounter - 1;
        lastBredAt[parent1] = block.timestamp;
        lastBredAt[parent2] = block.timestamp;

        emit CreatureBred(parent1, parent2, newId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "";
    }
}
