import * as discord from 'discord-gamesdk-js'

let status = {
    details: 'Main Menu',
    assets: {
        smallImage: 'fox_hr1',
        largeImage: 'fox_hr0',
        smallText: 'or my son ever again',
        largeText: 'don\'t talk to me'
    }
} as any

let bridge = {} as any

bridge.start = function () {
    discord.create('577671608651612162')
    discord.updateActivity(status)
    return setInterval(discord.runCallbacks, 1000 / 60)
}

bridge.onJoin = function (callback: Function) {
    discord.onActivityJoin(callback)
}

bridge.joinLobby = function (roomcode: string, players: number, maxsize: number) {
    status.party = {
        id: roomcode,
        currentSize: players,
        maxSize: maxsize
    }
    status.details = 'In Lobby'
    status.state = roomcode
    discord.updateActivity(status)
}

bridge.updateJoinSecret = function (roomcode: string, salt: string) {
    // stonks - first 4 digits are what we need, salt makes it unique
    const secret = roomcode + salt
    status.secrets = {
        join: secret
    }
    discord.updateActivity(status)
}

bridge.updatePlayers = function (players: number, maxsize: number) {
    if (!status.party) return

    status.party.currentSize = players
    status.party.maxSize = maxsize
    discord.updateActivity(status)
}

bridge.onBoard = function () {
    status.details = 'On Board'
    discord.updateActivity(status)
};

// Link bridge functions to window
(window as any).bridge = bridge