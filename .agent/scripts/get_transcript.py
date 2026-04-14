import sys
from youtube_transcript_api import YouTubeTranscriptApi

def main():
    if len(sys.argv) < 2:
        print("Error: No video ID provided.")
        sys.exit(1)
        
    video_id = sys.argv[1]
    try:
        tx = YouTubeTranscriptApi.get_transcript(video_id, languages=['fr', 'en'])
        text = ' '.join([t['text'] for t in tx])
        print(text)
    except Exception as e:
        print('Error:', e)

if __name__ == "__main__":
    main()
