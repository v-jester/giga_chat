const users = {};

export default function userHandlers(io, socket) {
  const { roomId, userName } = socket.handshake.query; // получаем данные при подключении

  if (!roomId || !userName) {
    console.error("Missing roomId or userName");
    return;
  }

  // Инициализация хранилища пользователей
  if (!users[roomId]) {
    users[roomId] = [];
  }

  // Обновление списка пользователей
  const updateUserList = () => {
    io.to(roomId).emit("user_list:update", users[roomId]);
  };

  // Добавление пользователя
  socket.on("user:add", (user) => {
    user.socketId = socket.id; // Сохраняем идентификатор сокета

    if (!users[roomId].find((u) => u.userName === user.userName)) {
      users[roomId].push(user); // Добавляем пользователя только если его еще нет
    }

    socket.to(roomId).emit("log", `User ${user.userName} connected`);
    updateUserList(); // Обновляем список пользователей
  });

  // Удаление пользователя при отключении
  socket.on("disconnect", () => {
    if (!users[roomId]) return;

    users[roomId] = users[roomId].filter((u) => u.socketId !== socket.id);

    if (users[roomId].length === 0) {
      delete users[roomId]; // Удаляем комнату, если в ней больше нет пользователей
    } else {
      socket.to(roomId).emit("log", `User ${userName} disconnected`);
      updateUserList();
    }
  });

  // Подключаем пользователя к комнате
  socket.join(roomId);
}
