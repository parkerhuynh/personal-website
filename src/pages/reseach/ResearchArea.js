import React from 'react';

function Research() {
  return (
    <div class="mt-5">
      <div class="container my-5">
        <div class="row mt-5">
          <h3 class="mb-4">Research Area</h3>
        </div>
        <p>Over the past two years I had the opportunity to mainly contribute to the following projects:</p>
        <h4 class="mt-5">Adversarial Attacks on Speech Recognition Systems for Mission Critical Applications</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <p>From June 2021 to September 2021, I had the opportunity to work with Dr. Imran Razzak and Dr. Mohamed Reda Bouadjenek
            in the context of the 2021 SIT Research Program Initialisation Grant lead by the CITECORE and D2L research centres. The project aimed to study,
            analyse, and develop an Automatic Speech Recognition system for mission critical applications, robust to adversarial attacks. Specifically, recent
            advances in machine learning, natural language processing, and voice recognition technologies have allowed the development and deployment of
            speech-based conversational interfaces to interact with various systems and objects such as autonomous vehicles, personal assistants, and different
            IoT objects. With the growth of machine learning, recent cyberattacks focus on fooling new visual and conversational interfaces and have shown their
            vulnerability to adversarial samples. The fabricated pieces trick the deep learning networks into making wrong predictions. My main contributions
            and outcomes of my work consist of:
            <ul>
              <li>A survey paper I have written to analyze, contrast, and compare various techniques for Adversarial Attacks on Speech
                Recognition Systems for Mission Critical Applications. This paper also outlines the challenges and recommendations for adversarial attacks and
                defence in machine-critical applications. This paper has been submitted to Speech Communication - Elsevier 2022.</li>
              <li>A prototype I have developed with my supervisors that uses the Connectionist Temporal Classification (CTC) loss,
                an algorithm used to train deep neural networks in speech recognition, handwriting recognition, and other sequence problems. This model has
                been published online by the Keras Team and is now part of the official Keras example library:
                <a href="https://keras.io/examples/audio/ctc_asr/" target="_blank">https://keras.io/examples/audio/ctc_asr/</a>.</li>
              <li>I have participated and presented my findings during two workshops organized in the context of the 2021 SIT
                Research Program Initialisation Grant by the CITECORE and D2L research centres. The panel committee for the workshops involved Prof. Arkady
                Zaslavsky, Dr. Chetan Arora, and Senior Lecturer Kevin Lee, Dr. Imran Razzak, Dr. Mohamed Reda Bouadjenek, and Dr. Ali Hassani..</li>
            </ul>
          </p>

        </div>

        <h4 class="mt-5">Industry Engagement and Demonstrators Grant</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <p>From November 2021 to March 2022, I worked on this project where I aimed to build a demonstration as a proof of concept to create a model
            to control a smart home using a voice-based interface in the context of the Industry Engagement and Demonstrators Grant (IEDG) 2021. Nowadays,
            the usage of IoT devices has become very popular. Its research gives rise to many innovative applications in healthcare, communication, and smart homes.
            Smart homes have been a hot research topic and attracted many researchers in recent years. Smart devices in smart homes such as temperature sensors and
            smart TVs send collected data to relational databases allowing developers to query them using different query languages such as Context Definition and
            Query Language (CDQL). However, CDQL requires understanding its formulas for updating and searching data content in the host databases. The aim of the
            project is to introduce a user interface named Speech-to-CDQL to allow users from different backgrounds to control a smart home using a voice-based
            interface directly. My main contributions and outcomes of my work consist of:
            <ul>
              <li>The model which I have created has two components: a speech recognition system (Google speech recognition) and a text-2-CDQL system based
                on Encoder-Decoder RNN architectures. Three encoder-decoder architectures are implemented for the text-2-CDQL system: basic architecture,
                Bahdanau attention, and Luong attention.</li>
              <li> I have used the Finite Automata approach to improve the result. The result shows that the accuracy and the Word Error Rate (WER) of the
                text-to-CDQL are 93% and 0.02%, respectively.</li>
              <li>I have participated and presented my findings during two workshops organized in the context of the 2021 SIT
                Research Program Initialisation Grant by the CITECORE and D2L research centres. The panel committee for the workshops involved Prof. Arkady
                Zaslavsky, Dr. Chetan Arora, and Senior Lecturer Kevin Lee, Dr. Imran Razzak, Dr. Mohamed Reda Bouadjenek, and Dr. Ali Hassani..</li>
            </ul>
          </p>

        </div>

        <h4 class="mt-5">Multi-Resolution Shallow Neural Network for Diabetic Foot Ulcers Detection</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <p>DFU2021 challenge Diabetes is one of those chronic diseases that affects other body parts including foot or limbs  ulceration, neuropathies,
            high blood pressure, nephropathy (kidney problem), vision problem. The Diabetic Foot Ulcer (DFU) is the most common disease among all diseases
            in diabetic patients. It is also known as Diabetic foot. DFUs are wounds that occur on the feet of diabetic people. We propose a Multi Resolution
            Multi Path Convolution Neural Network (MRMP-CNN) for identification of skin lesions. Our MRMP-CNN consists of several blocks which are concatenated
            hierarchically. The key contributions of this work are:
            <ul>
              <li>Multiresolutional shallow convolutional neural network for automatic classification of foot diabetes, i.e., ischaemia and infection.</li>
              <li> Experiments are performed in DFU2021 foot diabetes challenges and achieved state of the art performance.</li>
            </ul>
          </p>

        </div>


        <h4 class="mt-5">STOIC2021 - COVID-19 AI Challenge</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <p>From March 2021 to May 2022, I worked on this project where I aimed at predicting the severe outcome of COVID-19, based on the largest dataset of Computed 
          Tomography (CT) images of COVID-19 suspects and patients collected to date. Participants will have access to data from the STOIC project, recently published 
          in Radiology. The STOIC project collected CT images of 10,735 individuals suspected of being infected with SARS-COV-2 during the first wave of the pandemic 
          in France, from March to April 2020. The focus of the challenge is the prediction of severe COVID-19, defined as intubation or death within one month from 
          the acquisition of the CT scan (AUC, primary metric). COVID19 positivity will be assessed as a secondary metric in the leaderboard. The key contributions of 
          this work are:
            <ul>
              <li>I used Tensorflow to analyze 3D CT COVID-19 Lung Images as well as augment these images.</li>
              <li>I used a 3D DenseNet to predict the severe outcome of COVID-19. My model was the 6th Prize Winner of the challenge.</li>
            </ul>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Research;