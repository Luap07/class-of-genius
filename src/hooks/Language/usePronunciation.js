import { useCallback, useRef, useState } from "react";
import {
  checkPronunciation,
  getPronunciationAudio,
} from "../services/pronunciationService";


const usePronunciation = () => {

  const [isRecording, setIsRecording] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState(null);

  const [score, setScore] =
    useState(null);

  const [feedback, setFeedback] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  const mediaRecorder =
    useRef(null);

  const audioChunks =
    useRef([]);




  const startRecording = useCallback(
    async () => {

      try {

        setError(null);


        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });


        mediaRecorder.current =
          new MediaRecorder(stream);



        audioChunks.current = [];



        mediaRecorder.current.ondataavailable =
          (event) => {

            if (
              event.data.size > 0
            ) {

              audioChunks.current.push(
                event.data
              );

            }

          };



        mediaRecorder.current.onstop =
          () => {

            const blob =
              new Blob(
                audioChunks.current,
                {
                  type: "audio/webm",
                }
              );


            const url =
              URL.createObjectURL(
                blob
              );


            setAudioUrl(url);

          };



        mediaRecorder.current.start();


        setIsRecording(true);



      } catch (err) {

        setError(
          err.message ||
          "Microphone permission denied"
        );

      }

    },
    []
  );





  const stopRecording = useCallback(
    () => {

      if (
        mediaRecorder.current &&
        isRecording
      ) {

        mediaRecorder.current.stop();


        mediaRecorder.current.stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );


        setIsRecording(false);

      }

    },
    [
      isRecording,
    ]
  );







  const analyzePronunciation =
    useCallback(
      async ({
        audio,
        expectedText,
      }) => {

        try {

          setLoading(true);

          setError(null);



          const result =
            await checkPronunciation({
              audio,
              expectedText,
            });



          setScore(
            result.score
          );


          setFeedback(
            result.feedback
          );


          return result;



        } catch (err) {

          setError(
            err.message ||
            "Pronunciation analysis failed"
          );


        } finally {

          setLoading(false);

        }


      },
      []
    );







  const playWordAudio =
    useCallback(
      async (word) => {

        try {

          const audio =
            await getPronunciationAudio(
              word
            );


          const sound =
            new Audio(audio);


          sound.play();


        } catch (err) {

          setError(
            err.message
          );

        }

      },
      []
    );








  const reset = () => {

    setAudioUrl(null);

    setScore(null);

    setFeedback(null);

    setError(null);

  };





  return {

    isRecording,

    audioUrl,

    score,

    feedback,

    loading,

    error,


    startRecording,

    stopRecording,

    analyzePronunciation,

    playWordAudio,

    reset,

  };

};



export default usePronunciation;