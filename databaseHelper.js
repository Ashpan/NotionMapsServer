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

const getColNames = async (db, userId) => {
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
      name: userToken[0].name_col_name,
      address: userToken[0].address_col_name,
      notes: userToken[0].notes_col_name,
      mapsLink: userToken[0].maps_link_col_name,
      latitude: userToken[0].latitude_col_name,
      longitude: userToken[0].longitude_col_name,
      price: userToken[0].price_col_name,
      rating: userToken[0].rating_col_name,
    };
  }
};

const getFilterChoices = (type, filterProperties) => {
  switch (type) {
    case "multi_select":
      return (filterOptions = filterProperties.multi_select.options.map(
        (option) => option.name
      ));
    case "select":
      return filterProperties.select.options.map((option) => option.name);
    case "checkbox":
      return [`${filterProperties.name}`];
    default:
      return;
  }
};

const getLocationFilterChoices = (type, filterProperties, filter, colours) => {
  if (colours === undefined) {
    colours = {};
  }
  switch (type) {
    case "multi_select":
      return filterProperties.multi_select.map((option) => {
        if (option.name in colours) {
          return {
            name: option.name,
            colour: colours[option.name],
          };
        } else {
          return {
            name: option.name,
            colour: "default",
          };
        }
      });
    case "select":
      if (filterProperties.select === null) {
        return [];
      }
      if (filterProperties.select.name in colours) {
        return [
          {
            name: filterProperties.select.name,
            colour: colours[filterProperties.select.name],
          },
        ];
      } else {
        return [
          {
            name: filterProperties.select.name,
            colour: "default",
          },
        ];
      }
    case "checkbox":
      if (filter in colours && filterProperties.checkbox === true) {
        return [
          {
            name: filter,
            colour: colours[filter],
          },
        ];
      }
      return filterProperties.checkbox === true ? [{name: `${filter}`, colour: "default"}] : [];
    default:
      return;
  }
};

module.exports = {
  getUserApiKeyDatabaseId,
  getUserFilters,
  getColNames,
  getFilterChoices,
  getLocationFilterChoices,
};
