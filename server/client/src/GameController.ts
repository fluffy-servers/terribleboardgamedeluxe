import { RoomState } from '../../shared'

export class GameController {
    public static roomcode: string;
    public static state: RoomState;
    public static playerID: number;
    public static socket: SocketIOClient.Socket;
}