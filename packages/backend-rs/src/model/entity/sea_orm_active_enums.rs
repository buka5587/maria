//! `SeaORM` Entity, @generated by sea-orm-codegen 1.0.0

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "antenna_src")]
pub enum AntennaSrc {
    #[sea_orm(string_value = "all")]
    All,
    #[sea_orm(string_value = "group")]
    Group,
    #[sea_orm(string_value = "home")]
    Home,
    #[sea_orm(string_value = "instances")]
    Instances,
    #[sea_orm(string_value = "list")]
    List,
    #[sea_orm(string_value = "users")]
    Users,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "drive_file_usage_hint"
)]
pub enum DriveFileUsageHint {
    #[sea_orm(string_value = "userAvatar")]
    UserAvatar,
    #[sea_orm(string_value = "userBanner")]
    UserBanner,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "muted_note_reason")]
pub enum MutedNoteReason {
    #[sea_orm(string_value = "manual")]
    Manual,
    #[sea_orm(string_value = "other")]
    Other,
    #[sea_orm(string_value = "spam")]
    Spam,
    #[sea_orm(string_value = "word")]
    Word,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "note_visibility")]
pub enum NoteVisibility {
    #[sea_orm(string_value = "followers")]
    Followers,
    #[sea_orm(string_value = "hidden")]
    Hidden,
    #[sea_orm(string_value = "home")]
    Home,
    #[sea_orm(string_value = "public")]
    Public,
    #[sea_orm(string_value = "specified")]
    Specified,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "notification_type")]
pub enum NotificationType {
    #[sea_orm(string_value = "app")]
    App,
    #[sea_orm(string_value = "follow")]
    Follow,
    #[sea_orm(string_value = "followRequestAccepted")]
    FollowRequestAccepted,
    #[sea_orm(string_value = "groupInvited")]
    GroupInvited,
    #[sea_orm(string_value = "mention")]
    Mention,
    #[sea_orm(string_value = "pollEnded")]
    PollEnded,
    #[sea_orm(string_value = "pollVote")]
    PollVote,
    #[sea_orm(string_value = "quote")]
    Quote,
    #[sea_orm(string_value = "reaction")]
    Reaction,
    #[sea_orm(string_value = "receiveFollowRequest")]
    ReceiveFollowRequest,
    #[sea_orm(string_value = "renote")]
    Renote,
    #[sea_orm(string_value = "reply")]
    Reply,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "page_visibility")]
pub enum PageVisibility {
    #[sea_orm(string_value = "followers")]
    Followers,
    #[sea_orm(string_value = "public")]
    Public,
    #[sea_orm(string_value = "specified")]
    Specified,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_note_visibility"
)]
pub enum PollNoteVisibility {
    #[sea_orm(string_value = "followers")]
    Followers,
    #[sea_orm(string_value = "home")]
    Home,
    #[sea_orm(string_value = "public")]
    Public,
    #[sea_orm(string_value = "specified")]
    Specified,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "push_subscription_type"
)]
pub enum PushSubscriptionType {
    #[sea_orm(string_value = "admin.report")]
    AdminReport,
    #[sea_orm(string_value = "admin.sign_up")]
    AdminSignUp,
    #[sea_orm(string_value = "favourite")]
    Favourite,
    #[sea_orm(string_value = "follow")]
    Follow,
    #[sea_orm(string_value = "follow_request")]
    FollowRequest,
    #[sea_orm(string_value = "mention")]
    Mention,
    #[sea_orm(string_value = "poll")]
    Poll,
    #[sea_orm(string_value = "reblog")]
    Reblog,
    #[sea_orm(string_value = "status")]
    Status,
    #[sea_orm(string_value = "update")]
    Update,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "relay_status")]
pub enum RelayStatus {
    #[sea_orm(string_value = "accepted")]
    Accepted,
    #[sea_orm(string_value = "rejected")]
    Rejected,
    #[sea_orm(string_value = "requesting")]
    Requesting,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "user_emoji_mod_perm"
)]
pub enum UserEmojiModPerm {
    #[sea_orm(string_value = "add")]
    Add,
    #[sea_orm(string_value = "full")]
    Full,
    #[sea_orm(string_value = "mod")]
    Mod,
    #[sea_orm(string_value = "unauthorized")]
    Unauthorized,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "user_profile_ffvisibility"
)]
pub enum UserProfileFfvisibility {
    #[sea_orm(string_value = "followers")]
    Followers,
    #[sea_orm(string_value = "private")]
    Private,
    #[sea_orm(string_value = "public")]
    Public,
}
#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(string_enum = "camelCase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "user_profile_muting_notification_types"
)]
pub enum UserProfileMutingNotificationTypes {
    #[sea_orm(string_value = "app")]
    App,
    #[sea_orm(string_value = "follow")]
    Follow,
    #[sea_orm(string_value = "followRequestAccepted")]
    FollowRequestAccepted,
    #[sea_orm(string_value = "groupInvited")]
    GroupInvited,
    #[sea_orm(string_value = "mention")]
    Mention,
    #[sea_orm(string_value = "pollEnded")]
    PollEnded,
    #[sea_orm(string_value = "pollVote")]
    PollVote,
    #[sea_orm(string_value = "quote")]
    Quote,
    #[sea_orm(string_value = "reaction")]
    Reaction,
    #[sea_orm(string_value = "receiveFollowRequest")]
    ReceiveFollowRequest,
    #[sea_orm(string_value = "renote")]
    Renote,
    #[sea_orm(string_value = "reply")]
    Reply,
}
