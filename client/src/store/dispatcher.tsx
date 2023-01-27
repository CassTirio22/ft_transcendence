import { friendsMethods } from "./slices/friends";
import { messagesMethods } from "./slices/messages";

export const mapDispatchToProps = {
    ...messagesMethods,
    ...friendsMethods
}

export const mapStateToProps = (state: any) => state;

export const friendsStateToProps = (state: any) => ({friends: state.friends});

export const messagesStateToProps = (state: any) => ({messages: state.messages});