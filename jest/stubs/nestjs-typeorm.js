module.exports = {
  InjectDataSource: function () {
    return function () {};
  },
  InjectRepository: function () {
    return function () {};
  },
  TypeOrmModule: {
    forRoot: function () {
      return { module: {} };
    },
    forRootAsync: function () {
      return { module: {} };
    },
    forFeature: function () {
      return { module: {} };
    },
  },
  getDataSourceToken: function () {
    return 'DataSource';
  },
  getRepositoryToken: function () {
    return 'RepositoryToken';
  },
};
