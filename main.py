# Project Heimir by Alex Arbuckle #


# import <
from github import Github
from discord import Intents
from datetime import datetime as dt
from discord.ext import commands, tasks
from lxRbckl import requestsGet, githubGet, githubSet

# >


# local <
githubToken = ''
discordToken = ''

gData = {}
gFile = 'data.json'
gGithub = Github(githubToken)
gChannel = 1042924004467556393
gRepository = 'lxRbckl/Project-Heimir'
heimir = commands.Bot(command_prefix = '', intents = Intents.all())
gSettingLink = 'https://github.com/lxRbckl/Project-Skotak/raw/main/setting.json'

# >


@tasks.loop(minutes = 5)
async def getData() -> None:
    '''  '''

    global gData

    setting = requestsGet(pLink = gSettingLink)
    tData = {'language' : setting['language']['add'], 'topic' : setting['topic']['add']}
    for r in [r for u in setting['user']['add'] for r in gGithub.get_user(u).get_repos()]:

        # if (valid project) <
        if (r.full_name.split('/')[1] not in setting['project']['remove']):

            try:

                feed = githubGet(

                    pGithub = gGithub,
                    pFile = 'feed.json',
                    pRepository = r.full_name

                )['feed']

            except: feed = None
            finally:

                tData[r.full_name.split('/')[1]] = {

                    'projectLink' : f'https://github.com/{r.full_name}',
                    'description' : r.description if (r.description) else 'None',
                    'feedSubject' : list(feed['content'].keys()) if (feed) else [],
                    'topic' : [t for t in r.get_topics() if (t not in setting['topic']['remove'])],
                    'update' : dt.strptime(str(r.pushed_at).split(' ')[0], '%Y-%m-%d').strftime('%B %-d %Y'),
                    'language' : [l for l in r.get_languages().keys() if (l not in setting['language']['remove'])],
                    'feedLink' : f'https://raw.githubusercontent.com/{r.full_name}/main/feed.json' if (feed) else 'None'

                }

        # >

    # if (update) <
    if (gData != tData):

        githubSet(

            pData = tData,
            pFile = gFile,
            pGithub = gGithub,
            pRepository = gRepository

        )

        gData = tData
        await heimir.get_channel(gChannel).send('`Running`')

    # >


@heimir.event
async def on_ready(): getData.start()


# main <
if (__name__ == '__main__'): heimir.run(discordToken)

# >
