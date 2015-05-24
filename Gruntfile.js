module.exports=function(grunt){
    require('time-grunt')(grunt);//Grunt处理任务进度条提示

    grunt.initConfig({
        //默认文件目录在这里
        paths:{
            assets:'./assets',//输出的最终文件assets里面
            scss:'./css/sass',//推荐使用Sass
            css:'./css', //若简单项目，可直接使用原生CSS，同样可以grunt watch:base进行监控
            js:'./js', //js文件相关目录
            img:'./img' //图片相关
        },
        buildType:'Build',
        pkg: grunt.file.readJSON('package.json'),
        archive_name: grunt.option('name') || 'ghost-freewill',//此处可根据自己的需求修改

        //清理掉开发时才需要的文件
        clean: {
            pre: ['dist/', 'build/'],//删除掉先前的开发文件
            post: ['<%= archive_name %>*.zip'] //先删除先前生成的压缩包
        },

        uglify:{
            options:{
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' //js文件打上时间戳
            },
            dist: {
                 files: {
                     '<%= paths.assets %>/js/min.v.js': '<%= paths.js %>/custome.js'
                 }
            }
        },

        //压缩最终Build文件夹
        compress:{
            main:{
                options:{
                    archive:'<%= archive_name %>_<%= grunt.template.today("yyyy") %>-<%= grunt.template.today("mm") %>-<%= grunt.template.today("dd") %>_<%= grunt.template.today("h") %><%= grunt.template.today("TT") %>.zip'
                },
                expand:true,
                cwd:'build/',
                src:['**/*'],
                dest:''
            }
        },

        copy:{
            main:{
                files:[
                    {expand: true, src: ['assets/css/**'], dest: 'build/'},
                    {expand: true, src: ['assets/images/**'], dest: 'build/'},
                    {expand: true, src: ['assets/js/**'], dest: 'build/'},
                    {expand: true, src: ['*', '!.gitignore', '!.DS_Store','!Gruntfile.js','!package.json','!node_modules/**','!go.sh','!.ftppass','!<%= archive_name %>*.zip'], dest: 'build/'},
                ]
            },

            images:{
                        expand: true,
                        cwd:'img/',
                        src: ['**','!github.png'],
                        dest: 'assets/images/',
                        flatten:true,
                        filter:'isFile',
            },


            archive:{
                files:[
                        {expand: true, src: ['<%= archive_name %>.zip'], dest: 'dist/'}
                ]
            }
        },

        //Sass 预处理
        sass:{
            admin:{
                options:{
                    sourcemap:true,
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files:{
                    '<%= paths.css %>/style.css':'<%= paths.scss %>/style.scss',
                }
            }
        },

        //压缩 css
        cssmin:{
            options:{
                  keepSpecialComments: 0
              },
              compress:{
                    files:{
                     '<%= paths.assets %>/css/min.style.css': [
                     '<%= paths.css %>/style.css'
                 ]
                 }
              }
        },

        // 格式化和清理html文件
        htmlmin: {
            dist: {
                options: {
                removeComments: true,
                //collapseWhitespace: true //压缩html:根据情况开启与否
            },

            files: {
                'build/index.html': 'build/index.html',//清除html中的注释
                }
            }
        },


        //监听变化 默认grunt watch 监测所有开发文件变化
        watch:{
            options:{
                //开启 livereload
                livereload:true,
                //显示日志
                dateFormate:function(time){
                    grunt.log.writeln('Compile finished, time: '+time+'ms ' + (new Date()).toString());
                    grunt.log.writeln('Wating for more changes...');
                }
            },
            //css
            sass:{
                files:'<%= paths.scss %>/**/*.scss',
                tasks:['sass:admin','cssmin']
            },
            css:{
                files:'<%= paths.css %>/**/*.css',
                tasks:['cssmin']
            },
            js:{
                 files:'<%= paths.js %>/**/*.js',
                 tasks:['uglify']
            },
            //若不使用Sass，可通过grunt watch:base 只监测style.css和js文件
            base:{
                files:['<%= paths.css %>/**/*.css','<%= paths.js %>/**/*.js','img/**'],
                tasks:['cssmin','uglify']
            }

        },
    });

  //输出进度日志
  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + 'File: '+filepath + ' Status: ' + action);
  });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask('default', ['cssmin','uglify','htmlmin','copy:images']);
    grunt.registerTask('sass', ['sass:admin','cssmin']);
    //执行 grunt bundle --最终输出的文件 < name-生成日期.zip > 文件
    grunt.registerTask('bundle', ['clean:pre','copy:images', 'copy:main','cssmin','copy:archive', 'clean:post','htmlmin','compress',]);

    //grunt.registerTask('publish', ['sshexec:deploy']);

};
