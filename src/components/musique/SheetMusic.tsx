"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

interface SheetMusicProps {
  xmlContent: string
  currentNote: string | null
  onNoteChange: (note: string) => void
  isCorrect: boolean | null
}

export default function SheetMusic({ xmlContent, currentNote, onNoteChange, isCorrect }: SheetMusicProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const osmdRef = useRef<OSMD | null>(null)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)

  const highlightNote = useCallback((note: any, isCorrect: boolean | null) => {
    if (osmdRef.current && osmdRef.current.GraphicSheet) {
      (osmdRef.current.GraphicSheet.MeasureList as any).forEach((measure: any) => {
        measure.staffEntries.forEach((staffEntry: any) => {
          staffEntry.graphicalVoiceEntries.forEach((voiceEntry: any) => {
            voiceEntry.notes.forEach((graphicalNote: any) => {
              if (graphicalNote.sourceNote === note) {
                graphicalNote.setColor(isCorrect === null ? '#000000' : isCorrect ? '#00FF00' : '#FF0000')
              } else {
                graphicalNote.setColor('#000000')
              }
            })
          })
        })
      })
      osmdRef.current.render()
    }
  }, [])

  const getNoteNameWithOctave = useCallback((note: any): string => {
    const pitchName = note.Pitch.ToString()
    const octave = note.Pitch.Octave
    return `${pitchName}${octave}`
  }, [])

  const highlightFirstNote = useCallback(() => {
    if (osmdRef.current && osmdRef.current.Sheet) {
      const firstMeasure = osmdRef.current.Sheet.SourceMeasures[0]
      if (firstMeasure && firstMeasure.VerticalSourceStaffEntryContainers.length > 0) {
        const firstContainer = firstMeasure.VerticalSourceStaffEntryContainers[0]
        
        // Parcourir les conteneurs jusqu'à trouver un conteneur avec des VoiceEntries
        let firstVoiceEntry: any = null
        if ((firstContainer as any).VoiceEntries && (firstContainer as any).VoiceEntries.length > 0) {
          firstVoiceEntry = (firstContainer as any).VoiceEntries[0]
        } else {
          const containerWithVoiceEntries = firstMeasure.VerticalSourceStaffEntryContainers.find(
            (container: any) => (container as any).VoiceEntries && (container as any).VoiceEntries.length > 0
          )
          if (containerWithVoiceEntries) {
            firstVoiceEntry = (containerWithVoiceEntries as any).VoiceEntries[0]
          }
        }
  
        if (firstVoiceEntry && firstVoiceEntry.Notes && firstVoiceEntry.Notes.length > 0) {
          const firstNote = firstVoiceEntry.Notes[0]
          highlightNote(firstNote, null)
          onNoteChange(getNoteNameWithOctave(firstNote))
        } else {
          console.warn('No valid first note found')
        }
      }
    }
  }, [highlightNote, getNoteNameWithOctave, onNoteChange])

  const highlightCurrentNote = useCallback(() => {
    if (osmdRef.current && osmdRef.current.Sheet) {
      const allNotes = osmdRef.current.Sheet.SourceMeasures.flatMap((measure: any) => 
        measure.VerticalSourceStaffEntryContainers.flatMap((container: any) => {
          const voiceEntries = (container as any).VoiceEntries
          return voiceEntries ? voiceEntries.flatMap((entry: any) => entry.Notes) : []
        })
      )
  
      if (currentNoteIndex < allNotes.length) {
        const nextNote = allNotes[currentNoteIndex]
        highlightNote(nextNote, isCorrect)
        setCurrentNoteIndex(currentNoteIndex + 1)
        onNoteChange(getNoteNameWithOctave(nextNote))
      }
    }
  }, [currentNoteIndex, highlightNote, getNoteNameWithOctave, onNoteChange, isCorrect])

  useEffect(() => {
    if (divRef.current) {
      osmdRef.current = new OSMD(divRef.current, {
        autoResize: true,
        drawTitle: true,
        drawSubtitle: true,
      })
      osmdRef.current.load(xmlContent).then(() => {
        osmdRef.current?.render()
        highlightFirstNote()
      })
    }
  }, [xmlContent, highlightFirstNote])

  useEffect(() => {
    if (osmdRef.current && currentNote) {
      highlightCurrentNote()
    }
  }, [currentNote, isCorrect, highlightCurrentNote])

  return <div ref={divRef} className="w-full h-64 overflow-auto" />
}

