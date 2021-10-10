# Kiranator
I am working on making a custom moderator / reaction role / fun games bot for the Vtuber Kira Omori's Discord server. Since it doesn't matter to me I'll be making the bots repo public as it's an "upgraded" clone of my bot [Vivi (private)](https://github.com/Uhuh/Vivi)

Made by [Dylan Warren (Panku#0001)](https://github.com/uhuh).

# Environment setup
It is ***extremely ideal that you do this in a linux environment***. This bot works just fine in Windows Subsystem for Linux (WSL). If you don't have this installed follow [this guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

* Personally I use `yarn` over `npm`. There used to be great benefits to using `yarn` but as far as I know these days they aren't too different. However to follow good practices that companies use let's use `yarn` and a node version manager called `nvm`.

Install `yarn` by running these commands
> `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`  
> `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`

After the above finishes install by doing:
> `sudo apt update && sudo apt install --no-install-recommends yarn`

Verify that it installed correctly with `yarn -v`

After installing `yarn` make sure you install `node`. We want to make sure we're all using the same version of `node` so it is easiest to install a thing called `nvm`.
> `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`  
> `export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm`

Verify that `nvm` installed correctly with `nvm --version`

Node `16` is a nice version currently that is supported my almost all npm packages. so do  
> `nvm install 16 && nvm alias default 16`

# Running the bot

Now that your environment is primed and ready to run the bot we just have a few more things. :)

Instead of a `.json` file to store secrets we're gonna use the beloved `.env` file.  
Create a `.env` file and put this in it.
```
TOKEN=BotTokenHere
DEFAULT_BANNED=bad words go here separated by spaces
```
Be in the bots directory `Kiranator/` and run `yarn` to install all the packages.

Finally to run the bot just do `yarn start` and enjoy! :)