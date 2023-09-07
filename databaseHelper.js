const getUserApiKeyDatabaseId = async (db, userId) => {
  const { data: userToken, error } = await db
    .from("user_keys")
    .select()
    .eq("user_id", userId);
  if (error) {
    console.error(error);
    return null;
  }
  if (userToken.length === 0) {
    return null;
  } else {
    return {
      apiKey: userToken[0].api_secret,
      databaseId: userToken[0].database_id,
    };
  }
};

module.exports = {
  getUserApiKeyDatabaseId,
};
