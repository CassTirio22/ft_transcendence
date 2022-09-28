import { messagesMethods } from "./slices/messages";

export const mapDispatchToProps = {
    ...messagesMethods,
}

export const mapStateToProps = (state: any) => state;