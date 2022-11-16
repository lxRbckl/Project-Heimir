# import <
from time import sleep
from github import Github
from datetime import datetime as dt
from lxRbckl import requestsGet, githubGet, githubSet

# >


# local <
githubToken = ''

gFile = 'data.json'
gGithub = Github(githubToken)
gRepository = 'lxRbckl/Project-Heimir'
gSettingLink = 'https://github.com/lxRbckl/Project-Skotak/raw/main/setting.json'

# >


# main <
if (__name__ == '__main__'):

    aData = {}
    while (True):

        # set (setting, bData) <
        # iterate (repository per user) <
        setting = requestsGet(pLink = gSettingLink)
        bData = {'topic' : setting['topic'], 'language' : setting['language']['add']}
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

                    bData[r.full_name.split('/')[1]] = {

                        'projectLink' : f'https://github.com/{r.full_name}',
                        'description' : r.description if (r.description) else 'None',
                        'feedSubject' : list(feed['content'].keys()) if (feed) else [],
                        'topic' : [t for t in r.get_topics() if (t not in setting['topic']['remove'])],
                        'update' : dt.strptime(str(r.pushed_at).split(' ')[0], '%Y-%m-%d').strftime('%B %d %Y'),
                        'language' : [l for l in r.get_languages().keys() if (l not in setting['language']['remove'])],
                        'feedLink' : f'https://raw.githubusercontent.com/{r.full_name}/main/feed.json' if (feed) else 'None'

                    }

            # >

        # >

        # if (update) <
        if (aData != bData):

            githubSet(

                pData = bData,
                pFile = gFile,
                pGithub = gGithub,
                pRepository = gRepository

            )

        # >

        aData = bData
        sleep(60 * setting['interval'])

# >
