OutOfOffice
===========

A basic Out Of Office system

This comes in 2 parts

receive.js
==========

This reads emails as they arrive and replies to new senders with your Out Of Office message

To invoke this add the following to your .forward file.

server.js
=========

This allows you to set the dates you are away and edit the message that is sent to them.

Configure
=========

Edit the config.js to set the email domain and outgoing SMTP server