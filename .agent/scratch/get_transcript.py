import os, sys, subprocess
try:
  from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
  subprocess.run([sys.executable, '-m', 'pip', 'install', 'youtube-transcript-api'])
  from youtube_transcript_api import YouTubeTranscriptApi
tx = YouTubeTranscriptApi.get_transcript('_wQvuBTnxvM', languages=['en', 'fr'])
print(' '.join([t['text'] for t in tx]))
