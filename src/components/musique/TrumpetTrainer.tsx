"use client"

import React, { useState, useEffect } from 'react'
import SheetMusic from './SheetMusic'
import AudioAnalyzer from './AudioAnalyzer'
import FileUpload from './FileUpload'
import PerformanceMetrics from './PerformanceMetrics'

// Pre-registered music pieces
const preRegisteredPieces = [
  { 
    title: "Simple C Major Scale", 
    xml: `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
    <score-partwise version="3.1">
      <part-list>
        <score-part id="P1">
          <part-name>Music</part-name>
        </score-part>
      </part-list>
      <part id="P1">
        <measure number="1">
          <attributes>
            <divisions>1</divisions>
            <key>
              <fifths>0</fifths>
            </key>
            <time>
              <beats>4</beats>
              <beat-type>4</beat-type>
            </time>
            <clef>
              <sign>G</sign>
              <line>2</line>
            </clef>
          </attributes>
          <note>
            <pitch>
              <step>C</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>D</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>E</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>F</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
        </measure>
        <measure number="2">
          <note>
            <pitch>
              <step>G</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>A</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>B</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>C</step>
              <octave>5</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
        </measure>
      </part>
    </score-partwise>`
  },
  { 
    title: "Twinkle Twinkle Little Star", 
    xml: `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
    <score-partwise version="3.1">
      <part-list>
        <score-part id="P1">
          <part-name>Music</part-name>
        </score-part>
      </part-list>
      <part id="P1">
        <measure number="1">
          <attributes>
            <divisions>1</divisions>
            <key>
              <fifths>0</fifths>
            </key>
            <time>
              <beats>4</beats>
              <beat-type>4</beat-type>
            </time>
            <clef>
              <sign>G</sign>
              <line>2</line>
            </clef>
          </attributes>
          <note>
            <pitch>
              <step>C</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>C</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>G</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>G</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
        </measure>
        <measure number="2">
          <note>
            <pitch>
              <step>A</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>A</step>
              <octave>4</octave>
            </pitch>
            <duration>1</duration>
            <type>quarter</type>
          </note>
          <note>
            <pitch>
              <step>G</step>
              <octave>4</octave>
            </pitch>
            <duration>2</duration>
            <type>half</type>
          </note>
        </measure>
      </part>
    </score-partwise>`
  }
]

export default function TrumpetTrainer() {
  const [musicXML, setMusicXML] = useState<string | null>(null)
  const [currentNote, setCurrentNote] = useState<string | null>(null)
  const [expectedNote, setExpectedNote] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [performance, setPerformance] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })

  // Ajout de logs pour le débogage
  useEffect(() => {
    console.log('Current State:', {
      musicXML: !!musicXML,
      currentNote,
      expectedNote,
      isPlaying
    })
  }, [musicXML, currentNote, expectedNote, isPlaying])

  const handleFileUpload = (xmlContent: string) => {
    console.log('File uploaded:', xmlContent.slice(0, 200) + '...')
    setMusicXML(xmlContent)
    resetPerformance()
  }

  const handlePreRegisteredPieceSelect = (xml: string) => {
    console.log('Pre-registered piece selected')
    setMusicXML(xml)
    resetPerformance()
  }

  const resetPerformance = () => {
    console.log('Resetting performance')
    setPerformance({ correct: 0, total: 0 })
    setCurrentNote(null)
    setExpectedNote(null)
    setIsPlaying(false)
  }

  const handleNoteDetected = (detectedNote: string | null) => {
    console.log('Note detected:', { 
      detectedNote, 
      isPlaying, 
      expectedNote 
    })

    if (isPlaying && detectedNote) {
      setCurrentNote(detectedNote)
      
      if (expectedNote) {
        const isCorrect = compareNotes(detectedNote, expectedNote)
        console.log('Note comparison:', { 
          detectedNote, 
          expectedNote, 
          isCorrect 
        })

        setPerformance(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }))

        if (isCorrect) {
          // Move to the next note in the sheet music
          setCurrentNote(null)
        }
      }
    }
  }


  const compareNotes = (detectedNote: string, expectedNote: string): boolean => {
    const detectedPitch = detectedNote.charAt(0)
    const detectedOctave = detectedNote.slice(-1)
    const expectedPitch = expectedNote.charAt(0)
    const expectedOctave = expectedNote.slice(-1)

    return detectedPitch === expectedPitch && detectedOctave === expectedOctave
  }

  const handleExpectedNoteChange = (note: string) => {
    setExpectedNote(note)
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Pre-registered Pieces</h2>
        <div className="flex flex-wrap gap-2">
          {preRegisteredPieces.map((piece, index) => (
            <button
              key={index}
              onClick={() => handlePreRegisteredPieceSelect(piece.xml)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {piece.title}
            </button>
          ))}
        </div>
      </div>
      <FileUpload onFileUpload={handleFileUpload} />
      {musicXML && (
        <>
            <SheetMusic 
            xmlContent={musicXML} 
            currentNote={currentNote} 
            onNoteChange={handleExpectedNoteChange}
            isCorrect={expectedNote === currentNote} 
            />
          <div className="flex justify-between items-center my-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-full font-bold ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? 'Stop' : 'Start'}
            </button>
            <PerformanceMetrics performance={performance} />
          </div>
          <AudioAnalyzer onNoteDetected={handleNoteDetected} isListening={isPlaying} />
          <div className="mt-4">
            <p className="text-lg font-semibold">Expected Note: {expectedNote}</p>
            <p className="text-lg font-semibold">Detected Note: {currentNote}</p>
          </div>
          <div className="mt-4 bg-gray-100 p-2 rounded">
        <p>Debug Info:</p>
        <p>Is Playing: {isPlaying ? 'Yes' : 'No'}</p>
        <p>Music XML: {musicXML ? 'Loaded' : 'Not Loaded'}</p>
        <p>Expected Note: {expectedNote || 'None'}</p>
        <p>Current Note: {currentNote || 'None'}</p>
      </div>
        </>
      )}
    </div>
  )
}

