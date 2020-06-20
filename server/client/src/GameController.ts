import { RoomState, Room } from '../../shared'

export class GameController {
    public static roomcode: string;
    public static state: RoomState = RoomState.Menu;
    public static playerID: number;
    public static socket: SocketIOClient.Socket;

    public static chatOpen: boolean = false;
    public static chatTransitionComplete: boolean = true;
}