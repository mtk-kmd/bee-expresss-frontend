import axios from 'axios';

export {
  getApi,
  postApi,
  postPublicApi,
  putApi,
  putPublicApi,
  getGeoCodeApi,
  getPublicApi,
  getLocation,
};

async function getApi(url,token) {
    let res = '';
    await axios({
        method: "get",
        url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
        headers: {
            Authorization: "Bearer " + token,
        },
    }).then((response) => {
        res = response;
    }).catch((error) => {
        if (error.response) {
            res = error.response;
        }
        if (error.request) {
            res = {
                status: 500,
                data: {
                    message: "Server Error",
                },
            };
        }
    });

    return res;
};

async function getPublicApi(url) {
    let res = '';
    await axios({
        method: "get",
        url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
    }).then((response) => {
        res = response;
    }).catch((error) => {
        if (error.response) {
            res = error.response;
        }
        if (error.request) {
            res = {
                status: 500,
                data: {
                    message: "Server Error",
                },
            };
        }
    });

    return res;
}

async function postApi(url, token, data) {
  let res = '';
  await axios({
      method: 'post',
      url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
      data: data,
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then((response) => {
      res = response;
    }).catch((error) => {
      if (error.response) {
          res = error.response;
      }
      if (error.request) {
          res = error.request;
      }
  });

  return res;
};

async function postPublicApi(url, data) {
  let res = '';
  await axios({
        method: 'post',
        url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
        data: data,
    }).then((response) => {
        res = response;
    }).catch((error) => {
        if (error.response) {
            res = error.response;
        }
        if (error.request) {
            res = error.request;
        }
  });

  return res;
};

async function putApi(url, token, data) {
  let res = '';
  await axios({
      method: 'put',
      url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
      data: data,
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then((response) => {
      res = response;
    }).catch((error) => {
      if (error.response) {
          res = error.response;
      }
      if (error.request) {
          res = error.request;
      }
  });

  return res;
};

async function putPublicApi(url, data) {
  let res = '';
  await axios({
      method: 'put',
      url: process.env.NEXT_PUBLIC_API_LOCAL_DEV + url,
      data: data,
    }).then((response) => {
      res = response;
    }).catch((error) => {
      if (error.response) {
          res = error.response;
      }
      if (error.request) {
          res = error.request;
      }
  });

  return res;
};

async function getLocation(addressValue) {
  try {
    const response = await axios({
      method: 'GET',
      url: env.GOOGLE_MAP_GEOCODE_API,
      params: {
        address: addressValue,
        language: 'en'
      },
      headers: {
        'X-RapidAPI-Key': env.RapidAPI_Key,
        'X-RapidAPI-Host': env.GOOGLE_MAP_X_RapidAPI_Host,
      }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getGeoCodeApi(lat,long) {
    let response = '';
    await axios({
      method: "GET",
      url: env.GEOCODE_RAPID_API,
      params: {
        lat: lat,
        lon: long,
        "accept-language": "en",
        polygon_threshold: "0.0",
      },
      headers: {
        "X-RapidAPI-Key": env.RapidAPI_Key,
        "X-RapidAPI-Host": env.GEOCODE_X_RapidAPI_Host,
      },
    }).then((res) => {
        response = res;
    }).catch((error) => {
        if (error.response) {
          response = error.response;
        }
        if (error.request) {
          response = error.request;
        }
    });

    return response;
}
