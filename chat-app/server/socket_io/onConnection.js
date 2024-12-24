import userHandlers from "./handlers/user.handlers.js";

import messageHandlers from "./handlers/message.handlers.js";

export default function onConnection(io, socket) {
  try {
    // Извлекаем идентификатор комнаты и имя пользователя
    const { roomId, userName } = socket.handshake.query;

    // Проверяем наличие обязательных параметров
    if (!roomId || !userName) {
      console.error("Missing roomId or userName in handshake query.");
      socket.disconnect(true); // Принудительно отключаем сокет
      return;
    }

    // Записываем параметры в объект сокета
    socket.roomId = roomId;
    socket.userName = userName;

    // Присоединяемся к комнате
    socket.join(roomId);
    console.log(`User ${userName} joined room ${roomId}`);

    // Регистрируем обработчики для пользователей
    userHandlers(io, socket);

    // Регистрируем обработчики для сообщений
    messageHandlers(io, socket);

    // Логируем успешное подключение
    console.log(`Handlers registered for user ${userName} in room ${roomId}`);
  } catch (error) {
    // Логируем ошибки
    console.error("Error in onConnection:", error.message);

    // Отключаем пользователя при ошибке
    socket.disconnect(true);
  }
}
