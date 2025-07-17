// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BattleGame {
    enum Type { Fire, Water, Grass }
    enum Turn { Player1, Player2 }
    enum BattleState { Waiting, InProgress, Finished }

    struct Creature {
        uint256 id;
        Type creatureType;
        uint256 hp;
        uint256 attack;
    }

    struct Battle {
        address player1;
        address player2;
        Creature creature1;
        Creature creature2;
        Turn currentTurn;
        BattleState state;
    }

    uint256 public battleId;
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256[]) public playerBattles;

    // ✅ Matchmaking-related state
    mapping(address => bool) public inQueue;
    address[] public matchmakingQueue;

    event BattleInitiated(uint256 indexed battleId, address player1, address player2);
    event TurnPlayed(uint256 indexed battleId, address player, uint256 damageDealt);
    event BattleFinished(uint256 indexed battleId, address winner);

    // ✅ Matchmaking events
    event MatchFound(uint256 indexed battleId, address indexed player1, address indexed player2);
    event JoinedQueue(address indexed player);
    event LeftQueue(address indexed player);

    // ========== Start a Battle ==========
    function initiateBattle(
        address _player2,
        uint256 _creature1Id,
        Type _creature1Type,
        uint256 _attack1,
        uint256 _hp1,
        uint256 _creature2Id,
        Type _creature2Type,
        uint256 _attack2,
        uint256 _hp2
    ) external {
        require(_player2 != address(0), "Invalid opponent");

        battles[battleId] = Battle({
            player1: msg.sender,
            player2: _player2,
            creature1: Creature(_creature1Id, _creature1Type, _hp1, _attack1),
            creature2: Creature(_creature2Id, _creature2Type, _hp2, _attack2),
            currentTurn: Turn.Player1,
            state: BattleState.InProgress
        });

        emit BattleInitiated(battleId, msg.sender, _player2);
        battleId++;
    }

    // ========== Play a Turn ==========
    function playTurn(uint256 _battleId) external {
        Battle storage b = battles[_battleId];
        require(b.state == BattleState.InProgress, "Battle not active");
        require(msg.sender == getCurrentPlayer(b), "Not your turn");

        Creature storage attacker = b.currentTurn == Turn.Player1 ? b.creature1 : b.creature2;
        Creature storage defender = b.currentTurn == Turn.Player1 ? b.creature2 : b.creature1;

        uint256 damage = attacker.attack;
        if (hasTypeAdvantage(attacker.creatureType, defender.creatureType)) {
            damage += 5;
        }
        if (random() % 5 == 0) {
            damage += 5;
        }

        if (defender.hp <= damage) {
            defender.hp = 0;
            b.state = BattleState.Finished;
            emit TurnPlayed(_battleId, msg.sender, damage);
            emit BattleFinished(_battleId, msg.sender);
            return;
        } else {
            defender.hp -= damage;
        }

        emit TurnPlayed(_battleId, msg.sender, damage);
        b.currentTurn = b.currentTurn == Turn.Player1 ? Turn.Player2 : Turn.Player1;
    }

    // ========== Matchmaking ==========
    function joinQueue(uint256 creatureId) external {
        require(!inQueue[msg.sender], "Already in matchmaking queue");

        inQueue[msg.sender] = true;
        matchmakingQueue.push(msg.sender);

        emit JoinedQueue(msg.sender);

        if (matchmakingQueue.length >= 2) {
            matchPlayers(creatureId);
        }
    }

    function matchPlayers(uint256 creatureId) internal {
        address player1 = matchmakingQueue[0];
        address player2 = matchmakingQueue[1];

        matchmakingQueue = _removeFirstTwoFromQueue();
        inQueue[player1] = false;
        inQueue[player2] = false;

        uint256 id = battleId++;
        battles[id] = Battle({
            player1: player1,
            player2: player2,
            creature1: Creature(creatureId, Type.Fire, 100, 20),  // ✅ Replace with real data later
            creature2: Creature(creatureId, Type.Grass, 100, 20),
            currentTurn: Turn.Player1,
            state: BattleState.InProgress
        });

        playerBattles[player1].push(id);
        playerBattles[player2].push(id);

        emit MatchFound(id, player1, player2);
    }

    function leaveQueue() external {
        require(inQueue[msg.sender], "Not in matchmaking queue");
        for (uint i = 0; i < matchmakingQueue.length; i++) {
            if (matchmakingQueue[i] == msg.sender) {
                matchmakingQueue[i] = matchmakingQueue[matchmakingQueue.length - 1];
                matchmakingQueue.pop();
                break;
            }
        }
        inQueue[msg.sender] = false;
        emit LeftQueue(msg.sender);
    }

    function _removeFirstTwoFromQueue() internal view returns (address[] memory) {
        address[] memory newQueue = new address[](matchmakingQueue.length - 2);
        for (uint i = 2; i < matchmakingQueue.length; i++) {
            newQueue[i - 2] = matchmakingQueue[i];
        }
        return newQueue;
    }

    // ========== View ==========
    function getBattle(uint256 _battleId) external view returns (Battle memory) {
        return battles[_battleId];
    }

    // ========== Helpers ==========
    function getCurrentPlayer(Battle storage b) internal view returns (address) {
        return b.currentTurn == Turn.Player1 ? b.player1 : b.player2;
    }

    function hasTypeAdvantage(Type attacker, Type defender) internal pure returns (bool) {
        return (attacker == Type.Fire && defender == Type.Grass) ||
               (attacker == Type.Water && defender == Type.Fire) ||
               (attacker == Type.Grass && defender == Type.Water);
    }

    function random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, battleId)));
    }
}
