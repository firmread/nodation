module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					{expand: true, cwd: 'components/pex/src/', src: ['**'], dest: 'public/scripts/libraries/pex/'},
					{expand: true, cwd: 'components/requirejs/', src: ['require.js'], dest: 'public/scripts/libraries/', filter: 'isFile'},
					{expand: true, cwd: 'components/requirejs-text/', src: ['text.js'], dest: 'public/scripts/libraries/', filter: 'isFile'},
					{expand: true, cwd: 'components/requirejs-domready/', src: ['domReady.js'], dest: 'public/scripts/libraries/', filter: 'isFile'}
				]
			}
		},
		exec: {
			pex: {
				command: function() {
					var cmd = "";
					cmd += "cd components";
					cmd += "&&";

					if (grunt.file.isDir('components/pex/')) {
						cmd += "cd pex";
						cmd += "&&";
						cmd += "git pull";
					}
					else {
						cmd += "git clone git@github.com:szymonkaliski/pex.git";
					}

					return cmd;
				}
			},
			npm: {
				command: 'npm update'
			},
			bower: {
				command: 'bower update'
			},
			mongod: {
				command: 'mongod'
			}
		},
		jshint: {
			files: ['public/scripts/*.js', 'public/scripts/**/*.js', '!public/scripts/libraries/**', '!public/scripts/<%= pkg.name %>.min.js', '*.js', 'modules/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					trailing: true
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					paths: { requireLib: 'libraries/require' },
					include: [ "requireLib" ],
					baseUrl: "public/scripts/",
					mainConfigFile: "public/scripts/app.js",
					name: "app",
					optimize: "uglify2",
					out: "public/scripts/<%= pkg.name %>.min.js"
				}
			}
		},
		env: {
			dev: { BUILD_ENV: 'DEVELOPMENT' },
			dist: { BUILD_ENV: 'PRODUCTION' }
		},
		preprocess: {
			index: { src: 'public/index.tpl', dest: 'public/index.html' },
		},
		nodemon: {
			dev: {
				script: 'app.js',
				options: {
					ignoredFiles: ['components/**', 'node_modules/**'],
					watchedExtensions: ['js'],
					env: {
						PORT: '3000'
					},
					cwd: __dirname
				}
			}
		},
		watch: {
			files: ['public/**', 'modules/**', '*.js', '!public/index.html'],
			tasks: ['lint', 'process']
		},
		concurrent: {
			dev: {
				// tasks: ['exec:mongod', 'nodemon', 'watch'],
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	});

	// load libs
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-preprocess');

	// building task
	grunt.registerTask('build', ['exec:npm', 'exec:bower', 'exec:pex', 'copy']);

	// linting task
	grunt.registerTask('lint', ['jshint']);

	// process task
	grunt.registerTask('process', ['env:dev', 'preprocess:index']);

	// run task
	grunt.registerTask('run', ['concurrent']);

	// default task
	grunt.registerTask('default', ['lint', 'process', 'run']);

	// heroku task
	grunt.registerTask('heroku', ['build', 'lint', 'requirejs', 'env:dist', 'preprocess:index']);
};
