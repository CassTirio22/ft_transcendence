import { friendsMethods } from "./slices/friends";
import { messagesMethods } from "./slices/messages";

export const mapDispatchToProps = {
    ...messagesMethods,
    ...friendsMethods
}

export const mapStateToProps = (state: any) => state;