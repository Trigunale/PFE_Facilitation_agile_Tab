/************************************************
 * AUTHOR:         Alexandre Cazala             *
 * CREATION_DATE:  23/11/16                      *
 * EMAIL:          alexandre.cazala@gmail.com   *
 * LICENSE:        Apache 2.0                   *
 ***********************************************/
'use strict';

angular.module('facilitation')
    .factory('Session', function ($resource) {
        return $resource('https://pfe-facilitation.herokuapp.com/auth/session/');
    });


/*
 return $resource('https://pfe-facilitation.herokuapp.com/auth/session/',
 {}, {headers: { 'Access-Control-Allow-Origin': '*' }});
 */