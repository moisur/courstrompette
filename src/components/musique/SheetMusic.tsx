"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

interface SheetMusicProps {
  xmlContent: string
  currentNote?: string | null
  onNoteChange?: (note: string) => void
  isCorrect?: boolean | null
  readOnly?: boolean
  className?: string
}

export default function SheetMusic({
  xmlContent,
  currentNote = null,
  onNoteChange,
  isCorrect = null,
  readOnly = false,
  className,
}: SheetMusicProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const osmdRef = useRef<OSMD | null>(null)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const isInteractive = !readOnly && typeof onNoteChange === 'function'

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
    if (!isInteractive || !onNoteChange) return

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
  }, [getNoteNameWithOctave, highlightNote, isInteractive, onNoteChange])

  const highlightCurrentNote = useCallback(() => {
    if (!isInteractive || !onNoteChange) return

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
  }, [currentNoteIndex, getNoteNameWithOctave, highlightNote, isCorrect, isInteractive, onNoteChange])

  useEffect(() => {
    setCurrentNoteIndex(0)
  }, [xmlContent])

  useEffect(() => {
    if (!divRef.current) return

    let cancelled = false
    const container = divRef.current
    container.innerHTML = ''

    osmdRef.current = new OSMD(container, {
      autoResize: true,
      drawTitle: true,
      drawSubtitle: true,
    })

    osmdRef.current.load(xmlContent)
      .then(() => {
        if (cancelled) return
        osmdRef.current?.render()
        if (isInteractive) {
          highlightFirstNote()
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to render sheet music:', error)
        }
      })

    return () => {
      cancelled = true
      osmdRef.current = null
      container.innerHTML = ''
    }
  }, [highlightFirstNote, isInteractive, xmlContent])

  useEffect(() => {
    if (isInteractive && osmdRef.current && currentNote) {
      highlightCurrentNote()
    }
  }, [currentNote, highlightCurrentNote, isCorrect, isInteractive])

  return <div ref={divRef} className={['w-full h-64 overflow-auto', className].filter(Boolean).join(' ')} />
}

