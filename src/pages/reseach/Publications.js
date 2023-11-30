import React from 'react';

function Research() {
  return (
    <div class="mt-5">
      <div class="container my-5">
        <div class="row mt-5">
          <h3 class="mb-4">Publications and Awards</h3>
        </div>
        <h4 class="mt-5">Publications</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <ul class="no-bullets"> <h5>2022</h5>
            <li class="underline" >
              2. Ngoc Dung Huynh, Mohamed Reda Bouadjenek, Imran Razzak, Kevin Lee, Chetan Arora, Ali Hassani, Arkady Zaslavsky,
              <a href="papers\MDM2022.pdf" download>Jarvis: A Voice-Based Context-as-a-Service Mobile Tool for a Smart Home Environment</a>,
              The 23rd IEEE International Conference on Mobile Data Management (MDM), 318-312, 2022.
            </li>
            <li class="underline" >
              1. Ngoc Dung Huynh, Mohamed Reda Bouadjenek, Imran Razzak, Kevin Lee, Chetan Arora, Ali Hassani, Arkady Zaslavsky,
              <a href="https://arxiv.org/abs/2202.10594" target="_blank">Adversarial Attacks on Speech Recognition Systems for Mission-Critical Applications: A Survey</a>, ArXiv, abs/2202.10594.
            </li>
          </ul>

        </div>
        <h4 class="mt-5">Awards</h4>
        <div class="mt-3" style={{ "text-align": "justify" }}>
          <ul class="no-bullets"> <h3>2022</h3>
            <li class="underline" >
              2. <a href="images\MDM2022_best_demo.jpeg" download>Best Demo Papers</a>:  Ngoc Dung Huynh, Mohamed Reda Bouadjenek, Ali Hassani, Imran Razzak, Kevin Lee, Chetan Arora, and Arkady Zaslavskya,
              Jarvis: A Voice-based Context-as-a-Service Mobile Tool for a Smart Home Environment. The 23rd IEEE International Conference on Mobile
              Data Management (MDM), 318-312, 2022.
            </li>
          </ul>
          <ul class="no-bullets"> <h3>2021</h3>
            <li class="underline" >
              1. <a href="deakin-challenge.pdf" download> 1st Prize Winner</a> of the Deakin Simpsons AI Challenge 2021
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Research;