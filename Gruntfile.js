/*
 * Zoe2
 * Next Generation Zoe Lib
 */

"use strict";

module.exports = function(grunt) {

	// grunt项目和任务配置
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		jshint : {
			all : {
				src : [
					'src/**/*.js'
				],
				options: {
					//忽略 "is better written in dot notation." 这一类warning
					'-W069' : true,
					'esnext' : true
				}
			}
		},

		requirejs : {
			compile : {
				options : {
					appDir : 'src/',
					baseUrl : './',
					dir : 'dest/',

					mainConfigFile : 'src/main.js',
    				skipModuleInsertion : true,
				    keepBuildDir : true,
					optimize : 'none',
    				removeCombined : true,

					modules : []
				}
			}
		},

		uglify : {
			options : {
				banner : [
					'/*\n',
					' * @info   : <%= pkg.name %>\n',
					' * @author : lizzz\n',
					' * \n',
					' * 文件已使用grunt压缩打包\n',
					' */\n'
				].join('')
			},

			build : {
				options : {
					preserveComments : 'some'
				},

				files : {}
			}
		},

		sass : {
		},

		copy : {
		},

		watch : {
		}
	});

	// 加载包含 uglify 任务的插件
	// 加载包含 requirejs 任务的插件
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// 默认被执行的任务列表。
	grunt.registerTask('default', ['jshint', 'requirejs', 'uglify']);
	
};