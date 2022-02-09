const players = [];

const addPlayer = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const moreThanTwo = players.length === 2;
  const existingUserIndex = players.findIndex((player) => player.room === room && player.name === name);

  if (!name || !room) return { error: 'Username and room are required.' };
  if (existingUserIndex !== -1) {
    players[existingUserIndex].id = id;
    return { error: 'Username is taken.' };
  }
  if (moreThanTwo) return { error: 'Room is full. Please create a new room' }

  const player = { id, name, room };
  console.log(player);
  players.push(player);

  return { player };
}

const removePlayer = (id) => {
  const index = players.findIndex((player) => player.id === id);

  if (index !== -1) return players.splice(index, 1)[0];
}

const getPlayer = (id) => players.find((player) => player.id === id);

const getPlayersInRoom = (room) => players.filter((player) => player.room === room);

module.exports = { addPlayer, removePlayer, getPlayer, getPlayersInRoom };
