'use strict';

exports.listeners = [];

exports.register = function (listener) {
  exports.listeners.push(listener);
};

exports.deRegisterAll = function(){
  exports.listeners = [];
};

exports.trigger = function(msg) {
  exports.listeners.forEach( (listener) => {
    listener(msg);
  });
};

