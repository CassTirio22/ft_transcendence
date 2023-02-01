import { blockedsMethods } from "./slices/blocked";
import { friendsMethods } from "./slices/friends";
import { gamesMethods } from "./slices/game";
import { gameHistoryMethods } from "./slices/game_history";
import { messagesMethods } from "./slices/messages";
import { watchMethods } from "./slices/watch";

export const mapDispatchToProps = {
    ...messagesMethods,
    ...friendsMethods,
    ...blockedsMethods,
    ...gamesMethods,
    ...gameHistoryMethods,
    ...watchMethods
}

export const mapStateToProps = (state: any) => ({
    friends: state.friends,
    blocked: state.blocked,
    messages: state.messages
});

export const friendsStateToProps = (state: any) => ({friends: state.friends, blocked: state.blocked});

export const messagesStateToProps = (state: any) => ({messages: state.messages});

export const gameStateToProps = (state: any) => ({game: state.game, game_history: state.game_history})

export const friendGameStateToProps = (state: any) => ({friends: state.friends, game_history: state.game_history, watch: state.watch})