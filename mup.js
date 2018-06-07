module.exports = {
  servers: {
    one: {
      host: '203.67.248.86',
      username: 'root',
      // pem: './path/to/pem'
      password: 's123'
      // or neither for authenticate from ssh-agent
    }
  },
  // proxy: {
  //   domains: 'jnadtechoauth.com',
  //   ssl: {
  //     letsEncryptEmail: 'nian@jnadtech.com'
  //   }
  // },
  meteor: {
    name: 'IOS_1798',
    path: '.',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },
    // ssl: {
    //   autogenerate: {
    //     email: 'nian@jnadtech.com',
    //     domains: 'jnadtechoauth.com'
    //   },
    //   port: 443,
    // },
    env: {
      PORT: 1798,
      ROOT_URL: 'http://203.67.248.86:1798/',
      // ROOT_URL: 'https://jnadtechoauth.com',
      MONGO_URL: 'mongodb://203.67.248.84:8888/1798DevDB',
    },

    docker: {
      image: 'abernix/meteord:node-8.4.0-base',
    },

    deployCheckWaitTime: 60,

    enableUploadProgressBar: true
  }
};
