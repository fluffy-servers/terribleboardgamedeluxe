import { RoomState } from '../../shared'
import BoardRenderer from './board/BoardRenderer'

export class GameController {
    public static roomcode: string
    public static state: RoomState = RoomState.Menu
    public static playerID: number
    public static socket: SocketIOClient.Socket

    public static board: BoardRenderer

    public static chatOpen: boolean = false
    public static chatTransitionComplete: boolean = true
}