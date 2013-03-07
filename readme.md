# Blogular  #
##Please be aware we are still in alpha many things are not user friendly yet##
###If you would like to contribute please see bottom of readme###
**Blogular** is a blog app that is built to have a ultra fast user interface and uses very little resources on the server.
 
Made to run on low memory environments such as the **Rasberry Pi**.

**Blogular blogs are realtime persisted chat rooms(alpha)**
See the the example at http://dunami.biz.  Please be aware connection is slow due to the host (AppFog) not supporting web
sockets.  So your name will not show on the list for a few seconds after login.

## Easy to get started  ##

To get started at the moment we only have a command line install:
	
	cd directoryToInstallTo

	git clone https://github.com/ray-garner/Blogular.git

	cd Blogular
	
	sudo npm install

Then install mongodb and start up mongo then...

	cd Blogular

	node app

And your running.

### Test it out ###
 Go to your browser and post a blog.


####Administrating your site ####

At the moment you have to type in 

http://YOURURL/admin.html

to get to the admin section of your site.
	** IT IS NOT USER FRIENDLY YET **

##Developers/Contributors##

We are using the latest Javascript stack tech

angularJS nodeJS etc...

Help us make an awesome fast super-hip lightweight blog.

Some things to implement:
1. Facebook/Twitter login  ie OAuth

2. Admin panel user friendliness.

3. Code clean up.

4. Threaded comments.

5. Overall U.I. (blogs)

6. Downloadable Theme system.



## Make it your own ##

Fork it love it do what you need share it with the community.