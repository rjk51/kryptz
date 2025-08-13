import React, { useState } from 'react';

const BattleField = ({ myCreatures, opponentCreatures }) => {
  // For demo, use first creature from each side
  const myCreature = myCreatures && myCreatures.length > 0 ? myCreatures[0] : { tokenId: 'N/A', hp: 25 };
  const opponentCreature = opponentCreatures && opponentCreatures.length > 0 ? opponentCreatures[0] : { id: 'N/A', hp: 20 };
  const [battleState, setBattleState] = useState(1);
  const [myHP, setMyHP] = useState(myCreature.hp || 25);
  const [opponentHP, setOpponentHP] = useState(opponentCreature.hp || 20);

  // Animation state: 'none', 'myAttack', 'opponentAttack'
  const [attackAnim, setAttackAnim] = useState('none');
  const [turn, setTurn] = useState('my'); // alternate turns
  const handlePlayTurn = () => {
    if (turn === 'my') {
      setAttackAnim('myAttack');
      setTimeout(() => {
        setAttackAnim('none');
        setOpponentHP(hp => Math.max(0, hp - 1));
        setTurn('opponent');
        setBattleState(battleState + 1);
      }, 500);
    } else {
      setAttackAnim('opponentAttack');
      setTimeout(() => {
        setAttackAnim('none');
        setMyHP(hp => Math.max(0, hp - 1));
        setTurn('my');
        setBattleState(battleState + 1);
      }, 500);
    }
  };

  return (
    <div style={{ background: '#222', color: '#fff', padding: 20, borderRadius: 8, fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 10 }}>
        <strong>Battle initiated!</strong>
      </div>
      <div style={{ border: '2px solid #fff', padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Battle #57</div>
        <div style={{ color: '#7ec7ff', marginBottom: 8 }}>Battle State: {battleState}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end', minHeight: 180 }}>
          {/* My Creature */}
          <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>YOU</div>
            <img
              src={myCreature.image || '/globe.svg'}
              alt="Your Creature"
              style={{
                width: 140,
                height: 140,
                marginBottom: 8,
                borderRadius: 12,
                objectFit: 'contain',
                background: '#333',
                border: attackAnim === 'myAttack' ? '4px solid #ffeb3b' : '4px solid #2196f3',
                boxShadow: attackAnim === 'myAttack' ? '0 0 32px #ffeb3b, 0 0 12px #2196f3' : '0 0 12px #2196f3',
                transition: 'all 0.3s',
                transform: attackAnim === 'myAttack' ? 'translateX(60px) scale(1.08) rotate(-5deg)' : attackAnim === 'opponentAttack' ? 'translateX(0px) scale(0.97) rotate(2deg)' : 'none',
                animation: attackAnim === 'myAttack' ? 'shake 0.3s' : 'none',
              }}
            />
            <div>ID: {myCreature.tokenId || myCreature.id}</div>
            <div style={{ margin: '8px 0' }}>
              <div style={{ fontSize: 12, color: '#7ec7ff', marginBottom: 2 }}>HP</div>
              <div style={{
                background: 'linear-gradient(90deg, #4caf50 0%, #ffeb3b 100%)',
                borderRadius: 6,
                height: 18,
                width: 120,
                boxShadow: '0 0 8px #2196f3 inset',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid #2196f3',
              }}>
                <div style={{
                  background: myHP > 10 ? 'rgba(76,175,80,0.8)' : 'rgba(255,82,82,0.8)',
                  width: `${(myHP / 25) * 100}%`,
                  height: '100%',
                  borderRadius: 6,
                  transition: 'width 0.3s',
                }} />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 13,
                  textShadow: '0 0 2px #333',
                }}>{myHP}</div>
              </div>
            </div>
          </div>
          {/* Center VS and effect */}
          <div style={{ flex: 0.2, textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 12, letterSpacing: 2 }}>VS</div>
            {/* Attack effect */}
            {attackAnim !== 'none' && (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: attackAnim === 'myAttack' ? 'radial-gradient(circle, #ffeb3b 60%, #fff 100%)' : 'radial-gradient(circle, #ff5252 60%, #fff 100%)',
                margin: '0 auto',
                boxShadow: attackAnim === 'myAttack' ? '0 0 32px #ffeb3b' : '0 0 32px #ff5252',
                animation: 'pulse 0.5s',
                opacity: 0.85,
              }} />
            )}
          </div>
          {/* Opponent Creature */}
          <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>OPPONENT</div>
            <img
              src={opponentCreature.image || '/globe.svg'}
              alt="Opponent Creature"
              style={{
                width: 140,
                height: 140,
                marginBottom: 8,
                borderRadius: 12,
                objectFit: 'contain',
                background: '#333',
                border: attackAnim === 'opponentAttack' ? '4px solid #ff5252' : '4px solid #fff',
                boxShadow: attackAnim === 'opponentAttack' ? '0 0 32px #ff5252, 0 0 12px #fff' : '0 0 12px #fff',
                transition: 'all 0.3s',
                transform: attackAnim === 'opponentAttack' ? 'translateX(-60px) scale(1.08) rotate(5deg)' : attackAnim === 'myAttack' ? 'translateX(0px) scale(0.97) rotate(-2deg)' : 'none',
                animation: attackAnim === 'opponentAttack' ? 'shake 0.3s' : 'none',
              }}
            />
            <div>ID: {opponentCreature.tokenId || opponentCreature.id}</div>
            <div style={{ margin: '8px 0' }}>
              <div style={{ fontSize: 12, color: '#ff5252', marginBottom: 2 }}>HP</div>
              <div style={{
                background: 'linear-gradient(90deg, #ff5252 0%, #fff 100%)',
                borderRadius: 6,
                height: 18,
                width: 120,
                boxShadow: '0 0 8px #ff5252 inset',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid #ff5252',
              }}>
                <div style={{
                  background: opponentHP > 10 ? 'rgba(76,175,80,0.8)' : 'rgba(255,82,82,0.8)',
                  width: `${(opponentHP / 20) * 100}%`,
                  height: '100%',
                  borderRadius: 6,
                  transition: 'width 0.3s',
                }} />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 13,
                  textShadow: '0 0 2px #333',
                }}>{opponentHP}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Keyframes for shake and pulse */}
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0) scale(1) rotate(0deg); }
            20% { transform: translateX(-8px) scale(1.05) rotate(-2deg); }
            40% { transform: translateX(8px) scale(1.08) rotate(2deg); }
            60% { transform: translateX(-8px) scale(1.05) rotate(-2deg); }
            80% { transform: translateX(8px) scale(1.08) rotate(2deg); }
            100% { transform: translateX(0) scale(1) rotate(0deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(0.7); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.85; transform: scale(1); }
          }
        `}</style>
        <button style={{ background: '#2196f3', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }} onClick={handlePlayTurn}>
          PLAY TURN
        </button>
      </div>
    </div>
  );
};

export default BattleField;
