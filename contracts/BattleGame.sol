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

    event BattleInitiated(uint256 indexed battleId, address player1, address player2);
    event TurnPlayed(uint256 indexed battleId, address player, uint256 damageDealt);
    event BattleFinished(uint256 indexed battleId, address winner);

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

        // Calculate type advantage
        uint256 damage = attacker.attack;
        if (hasTypeAdvantage(attacker.creatureType, defender.creatureType)) {
            damage += 5; // Bonus damage for type advantage
        }

        // Add randomness (simulated pseudo-random critical hit)
        if (random() % 5 == 0) {
            damage += 5; // Critical hit
        }

        // Apply damage
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

        // Switch turns
        b.currentTurn = b.currentTurn == Turn.Player1 ? Turn.Player2 : Turn.Player1;
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

    // ========== View Functions ==========
    function getBattle(uint256 _battleId) external view returns (Battle memory) {
        return battles[_battleId];
    }
}
