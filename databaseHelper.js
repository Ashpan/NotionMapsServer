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

const getUserFilters = async (db, userId) => {
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
} else if (!userToken[0].filters) {
  return {
    filters: [],
  };
} else {
  return {
    filters: JSON.parse(userToken[0].filters),
  };
}
};

module.exports = {
  getUserApiKeyDatabaseId,
  getUserFilters
};
