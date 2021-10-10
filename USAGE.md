<div class="commands">

# Server Configuration
<hr style="border: 1px solid grey;background-color:grey;width:100%">

`<>` = required arguments | `[]` = optional arguments
<table style="width:100%">
  <col style="width:40%">
  <col style="width:35%">
  <col style="width:25%">
  <tr>
    <th>Command</th>
    <th>Examples</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>k.config</td>
    <td>k.config</td>
    <td>Show the configuration for the server.</td>
  </tr>
  <tr>
    <td>k.config prefix &lt;new prefix&gt;</td>
    <td>k.config prefix !</td>
    <td>Change the servers prefix.</td>
  </tr>
  <tr>
    <td>k.config join &lt;add | remove | list&gt; &lt;name | id&gt;</td>
    <td>k.config join add 781062380934266901<br>
      k.config join add Member<br>
      k.config join remove 781062380934266901<br>
      k.config join list
    </td>
    <td>Add or remove a role that will be given to any user that joins the server. You can view the roles being given out with the list option.</td>
  </tr>
  <tr>
    <td>k.config word &lt;add | delete&gt; &lt;word&gt;</td>
    <td>k.config word delete uwu<br>k.config word delete owo, 0w0, o3o<br>k.config word add uwu<br>k.config word add owo, 0w0, o3o</td>
    <td>Add or delete a word or list of words for the banned words filter list.</td>
  </tr>
  <tr>
    <td>k.config banmsg &lt;msg sent to banned users&gt;</td>
    <td>k.config banmsg You've been bad! Get out!</td>
    <td>Set the message that gets sent to users right before they're banned.</td>
  </tr>
  <tr>
    <td>k.config logs &lt;mod | server&gt; &lt;#channel | ID | remove&gt;</td>
    <td>k.config logs mod #mod-logs<br>k.config logs mod 773580650255089675<br>k.config logs server #server-logs<br>k.config logs mod remove</td>
    <td>Set specific log channels or remove them if you set them accidently!</td>
  </tr>
  <tr>
    <td>k.config mute &lt;@role | id | none&gt;</td>
    <td>k.config mute @Muted<br>k.config mute 750488381070245949<br>k.config mute none</td>
    <td>Set the mute role for KiraBot to use. If you use 'none' then KiraBot will remove it from the config.</td>
  </tr>
  <tr>
    <td>k.config warnexpire &lt;# days in range 1-30&gt;</td>
    <td>k.config warnexpire 5</td>
    <td>Set how long it takes for a users warn to expire and no longer be considered as a bannable offence.</td>
  </tr>
  <tr>
    <td>k.config maxwarns &lt;# in range 1-10&gt;</td>
    <td>k.config maxwarns 5</td>
    <td>Set how many active warns a user is allowed to have, their next warn would be their ban.</td>
  </tr>
  <tr>
    <td>k.config whitelist &lt;add | remove&gt; &lt;#channel | ID&gt;</td>
    <td>k.config whitelist add #mod-chat<br>k.config whitelist remove #general<br>k.config whitelist add 773580650255089675</td>
    <td>Whitelist channels you don't want KiraBot keeping server logs of.</td>
  </tr>
  <tr>
    <td>k.config listwords</td>
    <td>k.config listwords</td>
    <td>This will send all the banned words in a spoiler tag.</td>
  </tr>
  <tr>
    <td>k.config setup</td>
    <td>k.config setup</td>
    <td>If KiraBot failed to generate your servers config run this command to fix it.<br>Can only be run once if the server doesn't have a config.</td>
  </tr>
  <tr>
    <td>k.config banner &lt;left | center&gt;</td>
    <td>k.config banner center<br>k.config banner left</td>
    <td>Display KiraBot's welcome banners! There are currently only two default ones. A left avatar, or a center avatar.</td>
  </tr>
  <tr>
    <td>k.config welcome &lt;add | remove&gt; &lt;#channel | channel-id&gt;</td>
    <td>k.config welcome add #welcome<br>k.config welcome add 773580650255089675<br>k.config welcome remove</td>
    <td><span style="color:red">By default vivi doesn't have a welcome channel for you.</span> You use this command to tell KiraBot which channel to use when welcoming users with a banner.</td>
  </tr>
</table>

<br>

# Moderation Commands
<hr style="border: 1px solid grey;background-color:grey;width:100%">

`<>` = required arguments | `[]` = optional arguments

<table style="width:100%">
  <col style="width:35%">
  <col style="width:30%">
  <col style="width:35%">
  <tr>
    <th>Command</th>
    <th>Examples</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>k.ban &lt;@user | ID&gt; &lt;reason&gt;</td>
    <td>k.ban @Panku For being stinky<br>k.ban 125492204234997761 Was rude to me</td>
    <td>Ban a user by mention or ID</td>
  </tr>
  <tr>
    <td>k.checkwarns &lt;@user | ID&gt; [active]</td>
    <td>k.checkwarns @Panku<br>k.cw @Panku active</td>
    <td>Check a users warning history. If you want to view only their active warns pass active after mention/ID.<br>Use a user id to get warn history even after the user is gone!</td>
  </tr>
  <tr>
    <td>k.kick &lt;@user | ID&gt; &lt;reason&gt;</td>
    <td>k.kick @Panku Get out!<br>k.k @Panku Cya punk.</td>
    <td>Kick a user from the server.</td>
  </tr>
  <tr>
    <td>k.mute &lt;@user | ID&gt; &lt;reason&gt; | &lt;#[(m)inutes/(h)ours/(d)ays/(w)eeks/(y)ears]&gt;</td>
    <td>k.mute @Panku Annoying users in VC | 3d<br>k.mute @Panku Disruptive | 1d</td>
    <td>Mute a user for any given time. If you don't pass a time the user will be default muted for an hour.</td>
  </tr>
  <tr>
    <td>k.purge &lt;# of messages&gt;</td>
    <td>k.purge 10</td>
    <td>Class purge messages command.</td>
  </tr>
  <tr>
    <td>k.reason &lt;case ID&gt; &lt;new reason&gt; [ | &lt;#[(h)ours/(d)ays/(w)eeks/(m)onths/(y)ears]&gt; ]</td>
    <td>k.reason 12 Making users uncomfortable<br>k.reason 12 Disruptive in VC! | 3d<br>k.r 12 Changing warn reason!!</td>
    <td><span style="color:red">This command can only be ran in the configured mod-logs channel.</span> It allows you to reword mod logs(cases). You get the requried case id from the message embeds.<br>If you need to change a mute duration you can do that too by using the same time format as the mute command.</td>
  </tr>
  <tr>
    <td>k.say [#channel] &lt;words to say&gt;</td>
    <td>k.say #announcements New update incoming!<br>k.say Hey guys!</td>
    <td>Basic say command, if given a channel (anywhere in the command) KiraBot will send the message there.</td>
  </tr>
  <tr>
    <td>k.unban &lt;ID&gt; &lt;reason&gt;</td>
    <td>k.unban 125492204234997761 Appealed their ban!</td>
    <td>Classic unban command.</td>
  </tr>
  <tr>
    <td>k.unmute &lt;@user | ID&gt; &lt;reason&gt;</td>
    <td>k.unmute @Panku Apologized for being loud in VC.</td>
    <td>Unmute a muted user.</td>
  </tr>
  <tr>
    <td>k.unwarn &lt;warn ID&gt; &lt;reason&gt;</td>
    <td>k.unwarn 1337 Was a mistake</td>
    <td>Remove a warn offence from a users warnings. Get its ID from k.checkwarns command.</td>
  </tr>
  <tr>
    <td>k.warn &lt;@user | ID&gt; &lt;reason&gt;</td>
    <td>k.warn @Panku Not listening after verbal warning</td>
    <td>Warn a user to kep track of their warnings. Check their current warnings with k.checkwarns. If a user surpasses the servers max warns setting they get automatically banned.</td>
  </tr>
</table>

<br>

# General Commands
<hr style="border: 1px solid grey;background-color:grey;width:100%">

`<>` = required arguments | `[]` = optional arguments

<table style="width:100%">
  <col style="width:35%">
  <col style="width:30%">
  <col style="width:35%">
  <tr>
    <th>Command</th>
    <th>Examples</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>k.avatar [@user | id]</td>
    <td>k.avatar<br>k.ava<br>k.avatar @Panku<br>k.avatar 125492204234997761</td>
    <td>Grab a users avatar. Command alias is 'ava'. If no user ID is given or user mentioned it'll send your avatar!</td>
  </tr>
  <tr>
    <td>k.botstatus</td>
    <td>k.botstatus</td>
    <td>Sends general info about how manyt servers the bot'sF in.</td>
  </tr>
  <tr>
    <td>k.help [config | mod | general]</td>
    <td>k.help<br>k.help general</td>
    <td>Given one of the 3 arguments KiraBot will give you detailed commands for each category.</td>
  </tr>
  <tr>
    <td>k.status</td>
    <td>k.status</td>
    <td>Basic info about the server.</td>
  </tr>
  <tr>
    <td>k.userinfo [@user | ID]</td>
    <td>k.userinfo @Panku<br>k.userinfo 125492204234997761</td>
    <td>Get info for a users account along with how many warnings they have and a list of the active warns.</td>
  </tr>
</table>
</div>